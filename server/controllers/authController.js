import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import transporter from '../config/nodemailer.js';
import {EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE} from '../config/emailTemplates.js';
import crypto from 'crypto';
import validateEmail from '../utils/emailValidator.js';
import cloudinary from '../config/cloudinary.js';

export const register = async (req, res) => {
    const {name, email, password, referralCode} = req.body;

    if(!name || !email || !password) {
        return res.status(400).json({success: false, message: 'Please provide your name, email, and password'});
    }

    try {
        console.log(`Registration attempt for email: ${email}`);
        
        // Validate email format and existence
        console.log('Validating email...');
        const emailValidation = await validateEmail(email);
        console.log('Email validation result:', emailValidation);
        
        if (!emailValidation.isValid) {
            console.log(`Email validation failed: ${emailValidation.message}`);
            return res.status(400).json({
                success: false, 
                message: emailValidation.message,
                errorType: 'INVALID_EMAIL'
            });
        }

        // Check if user already exists
        console.log('Checking if user already exists...');
        const existingUser = await User.findOne({ where: { email } });

        if(existingUser){
            console.log(`User already exists with email: ${email}`);
            return res.status(400).json({
                success: false, 
                message: 'There is a user already registered with this email. Please use a different email address.',
                errorType: 'EMAIL_EXISTS'
            });
        }

        // Generate unique referral code for new user
        const uniqueReferralCode = crypto.randomBytes(4).toString('hex');

        // Handle referral if code is provided
        let referredBy = null;
        if (referralCode) {
            const referrer = await User.findOne({ where: { referralCode } });
            if (referrer) {
                referredBy = referrer.id;
                await referrer.increment('referralCount');
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Generate verification OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes from now as bigint

        let profilePicture = null;
        
        // Handle profile image upload if provided
        if (req.file) {
            try {
                // Convert buffer to base64
                const b64 = Buffer.from(req.file.buffer).toString('base64');
                const dataURI = `data:${req.file.mimetype};base64,${b64}`;
                
                // Upload to Cloudinary
                const uploadResult = await cloudinary.uploader.upload(dataURI, {
                    folder: 'profile_pictures',
                    resource_type: 'auto'
                });
                
                profilePicture = uploadResult.secure_url;
                console.log('Profile image uploaded to Cloudinary:', profilePicture);
            } catch (uploadError) {
                console.error('Error uploading profile image:', uploadError);
                // Continue with registration even if image upload fails
            }
        }

        console.log('Creating new user...');
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            referralCode: uniqueReferralCode,
            referredBy,
            verifyOtp: otp,
            verifyOtpExpireAt: otpExpiry,
            profilePicture // Store the Cloudinary URL
        });
        console.log(`User created with ID: ${user.id}`);

        // Send verification email
        try {
            const mailOptions = {
                from: {
                    name: 'Invest Up',
                    address: process.env.SENDER_EMAIL
                },
                to: email,
                subject: 'Email Verification',
                html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", email)
            };

            console.log('Sending verification email...');
            await transporter.sendMail(mailOptions);
            console.log('Verification email sent');
        } catch (emailError) {
            console.error('Error sending verification email:', emailError);
            // Continue with registration even if email fails
        }

        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '7days'});

        // Set cookie with more permissive settings for mobile
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        });

        console.log('Registration successful');
        return res.json({
            success: true,
            token: token,
            userData: {
                id: user.id,
                name: user.name,
                email: user.email,
                referralCode: user.referralCode,
                isAccountVerified: user.isAccountVerified,
                isAdmin: user.isAdmin,
                profilePicture: user.profilePicture // Include the profile picture URL in response
            },
            message: 'Registration successful! Please verify your email.'
        });

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const login = async (req, res) => {
    const {email, password} = req.body;

    if(!email || !password) {
        return res.status(400).json({
            success: false, 
            message: 'Please provide both email and password'
        });
    }

    try {
        // Find user by email
        const user = await User.findOne({ where: { email } });
        
        // If user doesn't exist, return specific error
        if(!user) {
            return res.status(401).json({
                success: false, 
                message: 'Email not registered',
                errorType: 'EMAIL_NOT_FOUND'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        
        // If password doesn't match, return specific error
        if(!isMatch) {
            return res.status(401).json({
                success: false, 
                message: 'Invalid password',
                errorType: 'INVALID_PASSWORD'
            });
        }

        // If user is not verified, return specific error
        if(!user.isAccountVerified) {
            return res.status(401).json({
                success: false, 
                message: 'Please verify your email before logging in',
                errorType: 'EMAIL_NOT_VERIFIED'
            });
        }

        // Generate JWT token
        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '7days'});

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // Return success response
        return res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isAccountVerified: user.isAccountVerified,
                isAdmin: user.isAdmin,
                balance: parseFloat(user.balance || 0).toFixed(2),
                referralCode: user.referralCode,
                referralCount: user.referralCount,
                referralEarnings: parseFloat(user.referralEarnings || 0).toFixed(2),
                successfulReferrals: user.successfulReferrals || 0,
                profilePicture: user.profilePicture
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false, 
            message: 'Server error during login',
            errorType: 'SERVER_ERROR'
        });
    }
};

export const logout = async (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        expires: new Date(0),
        path: '/'
    });
    res.json({success: true});
};

export const verifyEmail = async (req, res) => {
    const userId = req.userId;
    const { otp } = req.body;

    console.log(`Email verification attempt for user ID: ${userId}, OTP: ${otp}`);

    if(!otp){
        console.log('OTP not provided');
        return res.status(400).json({success: false, message: 'Please provide the verification code'});
    }

    try {
        console.log(`Finding user with ID: ${userId}`);
        const user = await User.findByPk(userId);

        if(!user){
            console.log(`User not found with ID: ${userId}`);
            return res.status(404).json({success: false, message: 'User not found'});
        }

        console.log(`User found: ${user.email}, stored OTP: ${user.verifyOtp}`);

        if(user.verifyOtp !== otp){
            console.log(`Invalid OTP. Expected: ${user.verifyOtp}, Received: ${otp}`);
            return res.status(400).json({success: false, message: 'Invalid verification code. Please check and try again.'});
        }

        if(Date.now() > user.verifyOtpExpireAt){
            console.log(`OTP expired. Expiry: ${new Date(user.verifyOtpExpireAt).toISOString()}, Current: ${new Date().toISOString()}`);
            return res.status(400).json({success: false, message: 'Verification code has expired. Please request a new one.'});
        }

        console.log('Updating user account to verified status');
        await user.update({
            isAccountVerified: true,
            verifyOtp: '',
            verifyOtpExpireAt: 0
        });

        console.log('Email verification successful');
        return res.json({
            success: true,
            message: 'Email verified successfully'
        });

    } catch (error) {
        console.error('Error in verifyEmail:', error);
        res.status(500).json({success: false, message: 'An error occurred during verification. Please try again.'});
    }
};

export const isAuthenticated = async (req, res) => {
    res.json({success: true});
};

export const sendResetOtp = async (req, res) => {
    const {email} = req.body;

    if(!email){
        return res.json({success: false, message: 'Please provide email'});
    }

    try {
        const user = await User.findOne({ where: { email } });

        if(!user){
            return res.json({success: false, message: 'User not found'});
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes from now as bigint

        await user.update({
            resetOtp: otp,
            resetOtpExpireAt: otpExpiry
        });

        const mailOptions = {
            from: {
                name: 'Invest Up',
                address: process.env.SENDER_EMAIL
            },
            to: email,
            subject: 'Password Reset Code',
            html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
        }

        await transporter.sendMail(mailOptions);

        return res.json({success: true});

    } catch (error) {
        res.json({success: false, message: error.message});
    }
};

export const resetPassword = async (req, res) => {
    const {email, otp, newPassword} = req.body;

    if(!email || !otp || !newPassword){
        return res.json({success: false, message: 'Missing details'});
    }

    try {
        const user = await User.findOne({ where: { email } });

        if(!user){
            return res.json({success: false, message: 'User not found'});
        }

        if(user.resetOtp !== otp){
            return res.json({success: false, message: 'Invalid OTP'});
        }

        if(Date.now() > user.resetOtpExpireAt){
            return res.json({success: false, message: 'OTP expired'});
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await user.update({
            password: hashedPassword,
            resetOtp: '',
            resetOtpExpireAt: 0
        });

        return res.json({success: true});

    } catch (error) {
        res.json({success: false, message: error.message});
    }
};

// Add new endpoint to handle referral registrations
export const registerWithReferral = async (req, res) => {
    const { name, email, password, referralCode } = req.body;

    if(!name || !email || !password || !referralCode) {
        return res.status(400).json({success: false, message: 'Please provide your name, email, password, and referral code'});
    }

    try {
        console.log(`Registration with referral attempt for email: ${email}`);
        
        // Validate email format and existence
        console.log('Validating email...');
        const emailValidation = await validateEmail(email);
        console.log('Email validation result:', emailValidation);
        
        if (!emailValidation.isValid) {
            console.log(`Email validation failed: ${emailValidation.message}`);
            return res.status(400).json({
                success: false, 
                message: emailValidation.message,
                errorType: 'INVALID_EMAIL'
            });
        }
        
        // Find referring user
        console.log(`Looking for referring user with code: ${referralCode}`);
        const referringUser = await User.findOne({ where: { referralCode } });
        if (!referringUser) {
            console.log('Invalid referral code');
            return res.status(400).json({
                success: false, 
                message: 'Invalid referral code',
                errorType: 'INVALID_REFERRAL'
            });
        }

        // Check if user already exists
        console.log('Checking if user already exists...');
        const existingUser = await User.findOne({ where: { email } });
        if(existingUser){
            console.log(`User already exists with email: ${email}`);
            return res.status(400).json({
                success: false, 
                message: 'There is a user already registered with this email. Please use a different email address.',
                errorType: 'EMAIL_EXISTS'
            });
        }

        // Generate unique referral code for new user
        const uniqueReferralCode = crypto.randomBytes(4).toString('hex');
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Generate verification OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes from now as bigint

        console.log('Creating new user with referral...');
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            referralCode: uniqueReferralCode,
            referredBy: referringUser.id,
            verifyOtp: otp,
            verifyOtpExpireAt: otpExpiry
        });
        console.log(`User created with ID: ${user.id}`);

        // Increment referral count for the referring user
        await referringUser.increment('referralCount');
        console.log(`Incremented referral count for user: ${referringUser.id}`);

        // Send verification email
        try {
            const mailOptions = {
                from: {
                    name: 'Invest Up',
                    address: process.env.SENDER_EMAIL
                },
                to: email,
                subject: 'Email Verification',
                html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", email)
            };

            console.log('Sending verification email...');
            await transporter.sendMail(mailOptions);
            console.log('Verification email sent');
        } catch (emailError) {
            console.error('Error sending verification email:', emailError);
            // Continue with registration even if email fails
        }

        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '7days'});

        // Set cookie with more permissive settings for mobile
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        });

        console.log('Registration with referral successful');
        // Also send token in response body for mobile clients
        return res.json({
            success: true,
            token: token, // Include token in response for mobile clients
            userData: {
                id: user.id,
                name: user.name,
                email: user.email,
                referralCode: user.referralCode,
                isAccountVerified: user.isAccountVerified,
                isAdmin: user.isAdmin
            },
            message: 'Registration successful! Please verify your email.'
        });

    } catch (error) {
        console.error('Registration with referral error:', error);
        return res.status(500).json({
            success: false, 
            message: 'An error occurred during registration. Please try again.',
            error: error.message
        });
    }
};

export const checkAuth = async (req, res) => {
    try {
        console.log('checkAuth route called');
        
        // Get token from cookies or Authorization header
        let token = req.cookies && req.cookies.token ? req.cookies.token : null;
        console.log('Cookie token:', token ? 'present' : 'not present');
        
        // Check Authorization header if no cookie token (for mobile clients)
        if (!token && req.headers && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            console.log('Authorization header:', authHeader ? `${authHeader.substring(0, 15)}...` : 'not present');
            
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
                console.log('Using token from Authorization header');
            }
        }
        
        if (!token) {
            console.log('No token found in request');
            return res.json({ success: false, isAuthenticated: false });
        }
        
        console.log('Token found, length:', token.length);

        // Verify the token
        try {
            console.log('Verifying token...');
            // Check if JWT_SECRET is properly set
            if (!process.env.JWT_SECRET) {
                console.error('JWT_SECRET is not set in environment variables');
                return res.status(500).json({ 
                    success: false, 
                    message: 'Server configuration error' 
                });
            }
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Token verified, decoded id:', decoded.id);
            
            // For temp users during Google auth process, return limited auth success
            if (decoded.isTempUser) {
                console.log('User is temporary - from Google auth flow');
                return res.json({ 
                    success: true, 
                    isAuthenticated: true,
                    isTempUser: true,
                    user: {
                        id: decoded.id,
                        email: decoded.email
                    }
                });
            }

            // Check if User model is available
            if (!User) {
                console.error('User model is not properly imported or defined');
                return res.status(500).json({ 
                    success: false, 
                    message: 'Server configuration error' 
                });
            }

            // Check if user exists in DB - use try/catch for database operation
            console.log('Looking up user in database with id:', decoded.id);
            try {
                const user = await User.findByPk(decoded.id);
                
                if (!user) {
                    console.log('User not found in database');
                    return res.json({ success: false, isAuthenticated: false });
                }

                // User is authenticated
                console.log('User authenticated successfully:', user.name);
                return res.json({ 
                    success: true, 
                    isAuthenticated: true,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        isAdmin: user.isAdmin || false,
                        isAccountVerified: user.isAccountVerified || false
                    } 
                });
            } catch (dbError) {
                console.error('Database error when finding user:', dbError);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Database error', 
                    error: dbError.message 
                });
            }
        } catch (jwtError) {
            console.error('Token verification failed:', jwtError.message);
            // For token errors, return 401 instead of 500
            return res.status(401).json({ 
                success: false, 
                isAuthenticated: false, 
                message: 'Invalid or expired token'
            });
        }
    } catch (error) {
        console.error('Auth check error:', error);
        return res.status(500).json({ 
            success: false, 
            isAuthenticated: false,
            message: 'Server error during authentication check',
            error: error.message
        });
    }
};