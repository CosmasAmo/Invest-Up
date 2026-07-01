import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import transporter from '../config/nodemailer.js';
import {EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE} from '../config/emailTemplates.js';
import crypto from 'crypto';
import validateEmail from '../utils/emailValidator.js';
import cloudinary from '../config/cloudinary.js';
import sequelize from '../config/database.js';
import zxcvbn from 'zxcvbn';

export const register = async (req, res) => {
    console.log('Registration request body:', req.body);
    console.log('Registration request body type:', typeof req.body);
    console.log('Registration request content-type:', req.headers['content-type']);
    
    // Handle both FormData and JSON requests
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    // Check both possible field names for referral code
    const referralCode = req.body.referralCode || req.body.referredBy;

    console.log('Extracted values:', { name, email, password: password ? 'Provided' : 'Not provided', referralCode });

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

        // Handle referral if code is provided
        // Note: Referral count will be incremented AFTER signup completion (email verification)
        let referredBy = null;
        if (referralCode) {
            console.log(`Looking for referring user with code: ${referralCode}`);
            try {
                const referrer = await User.findOne({ where: { referralCode } });
                if (referrer) {
                    console.log(`Found referrer with ID: ${referrer.id}`);
                    referredBy = referrer.id;
                    // Referral count will be incremented when user completes email verification
                } else {
                    console.log(`No referrer found with code: ${referralCode}`);
                }
            } catch (findError) {
                console.error('Error finding referrer:', findError);
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Generate verification OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes from now

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
        // Log the user object to debug what's being created
        console.log('User data to be created:', {
            name,
            email,
            referralCode: crypto.randomBytes(4).toString('hex'),
            referredBy: referredBy
        });

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            verifyOtp: otp,
            verifyOtpExpireAt: otpExpiry,
            referralCode: crypto.randomBytes(4).toString('hex'),
            referredBy: referredBy,
            profilePicture: profilePicture
        });
        console.log(`Created user with ID: ${user.id}, referredBy: ${user.referredBy}`);

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

        // Explicitly set CORS headers for cross-domain requests
        const origin = req.headers.origin;
        if (origin) {
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        }

        // Set cookie with proper cross-domain settings
        res.cookie('token', token, {
            httpOnly: true,
            secure: true, // Required for HTTPS
            sameSite: 'none', // Required for cross-domain
            domain: '.investuptrading.com', // Notice the dot prefix
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Also send token in response for mobile clients
        return res.json({
            success: true,
            token, // Include token in response
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                isAccountVerified: user.isAccountVerified
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred during login',
            error: error.message
        });
    }
};

export const logout = async (req, res) => {
    try {
        console.log('Processing logout request');
        
        // First, check if session is available to avoid the session support error
        if (!req.session) {
            console.log('Warning: No session found during logout request');
        } else {
            console.log('Destroying session');
            req.session.destroy((err) => {
                if (err) {
                    console.error('Error destroying session:', err);
                }
            });
        }
        
        // Clear the Passport session if it exists
        if (req.isAuthenticated && req.isAuthenticated()) {
            console.log('User is authenticated, attempting to logout');
            try {
                req.logout(function(err) {
                    if (err) { 
                        console.error('Error during logout:', err);
                    } else {
                        console.log('Passport logout successful');
                    }
                });
            } catch (logoutError) {
                console.error('Failed to logout from Passport:', logoutError);
                // Continue with the rest of the logout process
            }
        } else {
            console.log('User not authenticated via Passport, skipping passport logout');
        }
        
        // Clear the token cookie with multiple options to ensure it works across environments
        // Standard version
        res.cookie('token', '', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            expires: new Date(0),
            path: '/'
        });
        
        // Try with different SameSite settings
        res.cookie('token', '', {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            expires: new Date(0),
            path: '/'
        });
        
        // Try with specific domain (.investuptrading.com)
        res.cookie('token', '', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            expires: new Date(0),
            path: '/',
            domain: '.investuptrading.com'
        });
        
        // Sometimes needed for subdomain issues
        const domain = req.headers.host?.split(':')[0];
        if (domain && !domain.startsWith('localhost')) {
            res.cookie('token', '', {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                expires: new Date(0),
                path: '/',
                domain: domain
            });
        }
        
        // Also clear any Google OAuth related cookies
        const googleCookies = ['G_AUTHUSER_H', 'G_ENABLED_IDPS', 'connect.sid'];
        googleCookies.forEach(cookieName => {
            res.cookie(cookieName, '', {
                expires: new Date(0),
                path: '/'
            });
        });
        
        console.log('User logged out successfully');
        res.json({success: true, message: 'Logged out successfully'});
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({success: false, message: 'Error during logout'});
    }
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

        console.log(`User found: ${user.email}, stored OTP: ${user.verifyOtp}, type: ${typeof user.verifyOtp}`);
        console.log(`Submitted OTP: ${otp}, type: ${typeof otp}`);

        // Convert both OTPs to strings and trim any whitespace
        const storedOtp = String(user.verifyOtp || '').trim();
        const submittedOtp = String(otp || '').trim();

        console.log(`Comparing OTPs - Stored: "${storedOtp}", Submitted: "${submittedOtp}"`);
        console.log(`OTP lengths - Stored: ${storedOtp.length}, Submitted: ${submittedOtp.length}`);

        if(!storedOtp || storedOtp.length === 0) {
            console.log('No OTP stored for user');
            // Try to generate a new OTP for the user
            const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
            
            await user.update({
                verifyOtp: newOtp,
                verifyOtpExpireAt: otpExpiry
            });
            
            // Send a new verification email
            try {
                const mailOptions = {
                    from: {
                        name: 'Invest Up',
                        address: process.env.SENDER_EMAIL
                    },
                    to: user.email,
                    subject: 'Email Verification',
                    html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", newOtp).replace("{{email}}", user.email)
                };

                console.log('Sending new verification email...');
                await transporter.sendMail(mailOptions);
                console.log('New verification email sent');
            } catch (emailError) {
                console.error('Error sending verification email:', emailError);
            }
            
            return res.status(400).json({
                success: false, 
                message: 'No verification code found. A new code has been sent to your email.'
            });
        }

        if(storedOtp !== submittedOtp){
            console.log(`Invalid OTP. Expected: "${storedOtp}", Received: "${submittedOtp}"`);
            return res.status(400).json({success: false, message: 'Invalid verification code. Please check and try again.'});
        }

        const currentTime = Date.now();
        console.log(`Checking OTP expiry - Current: ${new Date(currentTime).toISOString()}, Expiry: ${new Date(user.verifyOtpExpireAt).toISOString()}`);

        if(currentTime > user.verifyOtpExpireAt){
            console.log(`OTP expired. Expiry: ${new Date(user.verifyOtpExpireAt).toISOString()}, Current: ${new Date().toISOString()}`);
            // Generate a new OTP
            const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
            
            await user.update({
                verifyOtp: newOtp,
                verifyOtpExpireAt: otpExpiry
            });
            
            // Send a new verification email
            try {
                const mailOptions = {
                    from: {
                        name: 'Invest Up',
                        address: process.env.SENDER_EMAIL
                    },
                    to: user.email,
                    subject: 'Email Verification',
                    html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", newOtp).replace("{{email}}", user.email)
                };

                console.log('Sending new verification email after expiry...');
                await transporter.sendMail(mailOptions);
                console.log('New verification email sent');
            } catch (emailError) {
                console.error('Error sending verification email:', emailError);
            }
            
            return res.status(400).json({
                success: false, 
                message: 'Verification code has expired. A new code has been sent to your email.'
            });
        }

        console.log('Updating user account to verified status');
        await user.update({
            isAccountVerified: true,
            isEmailVerified: true, // Also set email verified flag
            verifyOtp: '',
            verifyOtpExpireAt: 0
        });

        // Increment referral count for the referrer when signup is completed
        if (user.referredBy) {
            try {
                console.log(`User ${user.id} completed signup, incrementing referral count for referrer ${user.referredBy}`);
                const referrer = await User.findByPk(user.referredBy);
                if (referrer) {
                    await referrer.increment('referralCount');
                    await referrer.reload();
                    console.log(`Referral count incremented. Referrer ${referrer.id} now has ${referrer.referralCount} referrals`);
                } else {
                    console.log(`Referrer ${user.referredBy} not found`);
                }
            } catch (referralError) {
                console.error('Error incrementing referral count:', referralError);
                // Don't fail verification if referral count increment fails
            }
        }

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

export const sendResetOtp = async (req, res) => {
    const {email} = req.body;

    if(!email){
        return res.status(400).json({success: false, message: 'Please provide email'});
    }

    try {
        const user = await User.findOne({ where: { email } });

        if(!user){
            return res.status(404).json({success: false, message: 'User not found'});
        }

        // Check if there's a valid unexpired OTP - return that instead of creating a new one
        if(user.resetOtpExpireAt && Date.now() < user.resetOtpExpireAt) {
            console.log('Valid OTP already exists, returning expiry time');
            return res.json({
                success: true,
                message: 'Password reset code sent successfully',
                expiresAt: user.resetOtpExpireAt
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = Date.now() + 15 * 60 * 1000; // 15 minute from now

        await user.update({
            resetOtp: otp,
            resetOtpExpireAt: otpExpiry,
            resetAttempts: 0 // Reset attempts counter
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

        return res.json({
            success: true,
            message: 'Password reset code sent successfully',
            expiresAt: otpExpiry
        });

    } catch (error) {
        console.error('Send reset OTP error:', error);
        res.status(500).json({success: false, message: 'An error occurred while sending the reset code'});
    }
};

export const verifyResetOtp = async (req, res) => {
    const {email, otp} = req.body;

    if(!email || !otp){
        return res.status(400).json({success: false, message: 'Email and OTP are required'});
    }

    try {
        const user = await User.findOne({ where: { email } });

        if(!user){
            return res.status(404).json({success: false, message: 'User not found'});
        }

        // Check if OTP has expired
        if(Date.now() > user.resetOtpExpireAt){
            return res.status(400).json({success: false, message: 'Verification code has expired'});
        }

        // Check if OTP matches
        if(user.resetOtp !== otp){
            // Increment failed attempts
            await user.update({
                resetAttempts: (user.resetAttempts || 0) + 1
            });

            // Check if too many failed attempts
            if(user.resetAttempts >= 3) {
                await user.update({
                    resetOtp: '',
                    resetOtpExpireAt: 0,
                    resetAttempts: 0
                });
                return res.status(400).json({
                    success: false,
                    message: 'Too many failed attempts. Please request a new code'
                });
            }

            return res.status(400).json({success: false, message: 'Invalid verification code'});
        }

        // Generate a temporary token for password reset
        const resetToken = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' } // Allow 24 hours to reset the password
        );

        // Log token info for debugging
        console.log(`Generated reset token for user ${user.id} (${email}), expires in 24h`);

        // Clear OTP after successful verification to prevent reuse
        await user.update({
            resetAttempts: 0,
            resetOtp: '',
            resetOtpExpireAt: 0
        });

        return res.json({
            success: true,
            message: 'Verification code is valid',
            resetToken
        });

    } catch (error) {
        console.error('Verify reset OTP error:', error);
        res.status(500).json({success: false, message: 'An error occurred while verifying the code'});
    }
};

export const resetPassword = async (req, res) => {
    const {email, newPassword, resetToken} = req.body;

    if(!email || !newPassword || !resetToken){
        return res.status(400).json({success: false, message: 'Missing required fields'});
    }

    try {
        // Verify the reset token
        const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
        
        if(decoded.email !== email) {
            return res.status(400).json({success: false, message: 'Invalid reset token'});
        }

        const user = await User.findOne({ where: { email } });

        if(!user){
            return res.status(404).json({success: false, message: 'User not found'});
        }

        // Check password strength
        const passwordStrength = zxcvbn(newPassword);
        if(passwordStrength.score < 3) {
            return res.status(400).json({
                success: false,
                message: 'Password is too weak. Please choose a stronger password'
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user's password and clear reset fields
        await user.update({
            password: hashedPassword,
            resetOtp: '',
            resetOtpExpireAt: 0,
            resetAttempts: 0,
            lastPasswordChange: Date.now()
        });

        // Send confirmation email
        const mailOptions = {
            from: {
                name: 'Invest Up',
                address: process.env.SENDER_EMAIL
            },
            to: email,
            subject: 'Password Reset Successful',
            html: PASSWORD_RESET_SUCCESS_TEMPLATE.replace("{{email}}", user.email)
        };

        await transporter.sendMail(mailOptions);

        return res.json({
            success: true,
            message: 'Password reset successful'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        if(error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(400).json({success: false, message: 'Invalid or expired reset token'});
        }
        res.status(500).json({success: false, message: 'An error occurred while resetting the password'});
    }
};

export const checkAuth = async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);
        
        if (!user) {
            return res.json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        return res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                isAccountVerified: user.isAccountVerified,
            }
        });
    } catch (error) {
        console.error('Check auth error:', error);
        return res.json({ 
            success: false, 
            message: error.message 
        });
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

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Generate verification OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes from now

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
        // Log the user object to debug what's being created
        console.log('User data to be created:', {
            name,
            email,
            referralCode: crypto.randomBytes(4).toString('hex'),
            referredBy: referringUser.id
        });

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            verifyOtp: otp,
            verifyOtpExpireAt: otpExpiry,
            referralCode: crypto.randomBytes(4).toString('hex'),
            referredBy: referringUser.id,
            profilePicture: profilePicture
        });
        console.log(`Created user with ID: ${user.id}, referredBy: ${user.referredBy}`);

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
