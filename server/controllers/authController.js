import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import transporter from '../config/nodemailer.js';
import {EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE} from '../config/emailTemplates.js';
import crypto from 'crypto';

export const register = async (req, res) => {
    const {name, email, password, referralCode} = req.body;

    if(!name || !email || !password) {
        return res.json({success: false, message: 'Missing details'});
    }

    try {
        const existingUser = await User.findOne({ where: { email } });

        if(existingUser){
            return res.json({success: false, message:'User already exists'});
        }

        // Generate unique referral code for new user
        const uniqueReferralCode = crypto.randomBytes(4).toString('hex');

        // Handle referral if code is provided
        let referredBy = null;
        if (referralCode) {
            const referrer = await User.findOne({ where: { referralCode } });
            if (referrer) {
                referredBy = referrer.id;
                
                // Add referral bonus to referrer
                await Promise.all([
                    referrer.increment('referralCount'),
                    referrer.increment('referralEarnings', { by: 20.00 }),
                    referrer.increment('balance', { by: 20.00 })
                ]);

                // Fetch updated referrer data
                await referrer.reload();
                console.log('Updated referrer data:', {
                    referralCount: referrer.referralCount,
                    referralEarnings: referrer.referralEarnings,
                    balance: referrer.balance
                });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Generate verification OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = Date.now() + 10 * 60 * 1000;

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            referralCode: uniqueReferralCode,
            referredBy,
            verifyOtp: otp,
            verifyOtpExpireAt: otpExpiry
        });

        // Send verification email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Email Verification',
            html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", email)
        };

        await transporter.sendMail(mailOptions);

        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '7days'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({
            success: true,
            userData: {
                id: user.id,
                name: user.name,
                email: user.email,
                referralCode: user.referralCode,
                referralCount: 0,
                referralEarnings: 0,
                balance: 0
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.json({success: false, message: error.message});
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
            expiresIn: '30d'
        });

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        // Send user data without sensitive information
        res.json({
            success: true,
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
        expires: new Date(0)
    });
    res.json({success: true});
};

export const verifyEmail = async (req, res) => {
    const userId = req.userId;
    const { otp } = req.body;

    if(!otp){
        return res.json({success: false, message: 'Please provide OTP'});
    }

    try {
        const user = await User.findByPk(userId);

        if(!user){
            return res.json({success: false, message: 'User not found'});
        }

        if(user.verifyOtp !== otp){
            return res.json({success: false, message: 'Invalid OTP'});
        }

        if(Date.now() > user.verifyOtpExpireAt){
            return res.json({success: false, message: 'OTP expired'});
        }

        await user.update({
            isAccountVerified: true,
            verifyOtp: '',
            verifyOtpExpireAt: 0
        });

        return res.json({
            success: true,
            message: 'Email verified successfully'
        });

    } catch (error) {
        console.error('Error in verifyEmail:', error);
        res.json({success: false, message: error.message});
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
        return res.json({success: false, message: 'Missing details'});
    }

    try {
        // Find referring user
        const referringUser = await User.findOne({ where: { referralCode } });
        if (!referringUser) {
            return res.json({success: false, message: 'Invalid referral code'});
        }

        const existingUser = await User.findOne({ where: { email } });
        if(existingUser){
            return res.json({success: false, message:'User already exists'});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            referredBy: referringUser.id
        });

        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '7days'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({success: true});

    } catch (error) {
        res.json({success: false, message: error.message});
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
                balance: parseFloat(user.balance || 0).toFixed(2)
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};