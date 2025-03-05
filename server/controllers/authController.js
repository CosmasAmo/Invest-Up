import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import transporter from '../config/nodemailer.js';
import {EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE} from '../config/emailTemplates.js';
import crypto from 'crypto';
import validateEmail from '../utils/emailValidator.js';

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
                // Remove the immediate bonus - will be given after first deposit
                await referrer.increment('referralCount');
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Generate verification OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = Date.now() + 10 * 60 * 1000;

        console.log('Creating new user...');
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            referralCode: uniqueReferralCode,
            referredBy,
            verifyOtp: otp,
            verifyOtpExpireAt: otpExpiry
        });
        console.log(`User created with ID: ${user.id}`);

        // Send verification email
        try {
            const mailOptions = {
                from: process.env.SENDER_EMAIL,
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
        console.error('Registration error:', error);
        return res.status(500).json({
            success: false, 
            message: 'An error occurred during registration. Please try again.',
            error: error.message
        });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ success: false, message: 'Missing credentials' });
    }

    try {
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            return res.json({ success: false, message: 'Invalid credentials' });
        }

        // Check if user has a password (not a Google OAuth user)
        if (!user.password) {
            return res.json({ success: false, message: 'Please login with Google' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: '8h'
        });

        // Set cookie with more permissive settings for mobile
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 8 * 60 * 60 * 1000, // 8 hours
            path: '/'
        });

        // Send user data without sensitive information
        res.json({
            success: true,
            token: token, // Include token in response for mobile clients
            userData: {
                id: user.id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                isAccountVerified: user.isAccountVerified,
                balance: user.balance,
                referralCode: user.referralCode,
                referralCount: user.referralCount,
                referralEarnings: user.referralEarnings
            }
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
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
        const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.update({
            resetOtp: otp,
            resetOtpExpireAt: otpExpiry
        });

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Password Reset OTP',
            //text: `Your OTP for password reset is: ${otp}`
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
        const otpExpiry = Date.now() + 10 * 60 * 1000;

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
                from: process.env.SENDER_EMAIL,
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
        const { token } = req.cookies;
        
        if (!token) {
            return res.json({ success: false });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.json({ success: false });
        }

        res.json({
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
                successfulReferrals: user.successfulReferrals || 0
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};