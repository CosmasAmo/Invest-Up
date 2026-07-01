import express from 'express';
import {register, resetPassword, sendResetOtp, verifyResetOtp, verifyEmail, registerWithReferral, checkAuth} from '../controllers/authController.js';
import {login} from '../controllers/authController.js';
import {logout} from '../controllers/authController.js';
import userAuth from '../middleware/userAuth.js';
import jwt from 'jsonwebtoken';
import upload from '../middleware/fileUpload.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import User from '../models/userModel.js';
import cloudinary from '../config/cloudinary.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Op } from 'sequelize';
import { EMAIL_VERIFY_TEMPLATE } from '../config/emailTemplates.js';
import transporter from '../config/nodemailer.js';

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.options('/login', (req, res) => {
    const origin = req.headers.origin;
    
    // Set CORS headers
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    
    // Respond to preflight request with 204 No Content
    res.status(204).end();
});
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/verify-account', (req, res, next) => {
  console.log('Received verification request:', {
    headers: {
      authorization: req.headers.authorization ? 'Bearer xxx...' : 'None', // Don't log actual token
      cookie: req.headers.cookie ? 'Present' : 'None' // Don't log actual cookies
    },
    body: {
      otp: req.body.otp
    }
  });
  
  // Check for token in headers or cookies and log info
  const authHeader = req.headers.authorization;
  let token;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
    console.log('Found token in Authorization header');
    if (token) {
      console.log('Token length:', token.length);
      console.log('Token prefix:', token.substring(0, 10) + '...');
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token is valid, decoded user ID:', decoded.id);
      } catch (err) {
        console.error('Token verification failed:', err.message);
      }
    }
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
    console.log('Found token in cookies');
  } else {
    console.log('No token found in request');
  }
  
  next();
}, userAuth, verifyEmail);
authRouter.post('/is-auth', async (req, res) => {
  try {
    // Log request for debugging
    console.log('is-auth request received:', {
      hasAuthHeader: !!req.headers.authorization,
      hasCookies: !!req.cookies && !!req.cookies.token,
      method: req.method,
      path: req.path
    });
    
    // Get token from cookies or Authorization header
    let token = req.cookies?.token;
    
    // Check Authorization header if no cookie token
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
        console.log('Using token from Authorization header, prefix:', token.substring(0, 10) + '...');
      }
    }
    
    if (!token) {
      console.log('No token provided in request');
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // For regular user tokens, find the user in DB
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      console.log(`User not found with ID from token: ${decoded.id}`);
      return res.status(404).json({ 
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
    console.error('Error in is-auth endpoint:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
});
authRouter.post('/send-reset-otp', sendResetOtp);
authRouter.post('/verify-reset-otp', verifyResetOtp);
authRouter.post('/reset-password', resetPassword);
authRouter.post('/register-with-referral', registerWithReferral);
authRouter.get('/check', checkAuth);



// Add a debug route to check authentication status
authRouter.get('/debug-auth', (req, res) => {
    // Get token from cookies or Authorization header
    let token = req.cookies.token;
    
    // Check Authorization header if no cookie token (for mobile clients)
    let authHeaderToken = null;
    if (req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith('Bearer ')) {
            authHeaderToken = authHeader.substring(7);
        }
    }
    
    res.json({
        success: true,
        hasCookie: !!token,
        hasAuthHeader: !!authHeaderToken,
        cookieValue: token ? 'Present (hidden for security)' : 'Not present',
        authHeaderValue: authHeaderToken ? 'Present (hidden for security)' : 'Not present',
        cookies: req.cookies,
        headers: {
            origin: req.headers.origin,
            referer: req.headers.referer,
            host: req.headers.host,
            userAgent: req.headers['user-agent']
        }
    });
});

// Add a mobile-specific test endpoint
authRouter.get('/mobile-test', (req, res) => {
    res.json({
        success: true,
        message: 'Mobile API is working correctly',
        timestamp: new Date().toISOString(),
        headers: {
            userAgent: req.headers['user-agent'],
            authorization: req.headers.authorization ? 'Present (hidden)' : 'Not present'
        }
    });
});

authRouter.get('/test', (req, res) => {
  res.json({ message: "Auth router is working!" });
});

// Add this after the verify-account route

authRouter.post('/resend-verification', userAuth, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Find the user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Generate new OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes from now
    
    // Update user with new OTP
    await user.update({
      verifyOtp: newOtp,
      verifyOtpExpireAt: otpExpiry
    });
    
    // Send verification email
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
      
      return res.json({
        success: true,
        message: 'Verification email sent successfully'
      });
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email'
      });
    }
  } catch (error) {
    console.error('Error in resend verification:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Add a new device-independent verification endpoint
authRouter.post('/verify-email-with-code', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    console.log(`Device-independent verification attempt for email: "${email}", OTP: ${otp}`);
    
    if (!email || !otp) {
      console.log('Missing email or OTP');
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide both email and verification code' 
      });
    }
    
    // Find user by email
    console.log(`Searching for user with email: "${email}"`);
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log(`User not found with email: "${email}"`);
      return res.status(404).json({ 
        success: false, 
        message: 'User not found. Please check your email address.' 
      });
    }
    
    console.log(`User found: ID=${user.id}, email="${user.email}", stored OTP: ${user.verifyOtp}, type: ${typeof user.verifyOtp}`);
    console.log(`Submitted OTP: ${otp}, type: ${typeof otp}`);
    
    // Convert both OTPs to strings and trim any whitespace
    const storedOtp = String(user.verifyOtp || '').trim();
    const submittedOtp = String(otp || '').trim();
    
    console.log(`Comparing OTPs - Stored: "${storedOtp}", Submitted: "${submittedOtp}"`);
    console.log(`OTP lengths - Stored: ${storedOtp.length}, Submitted: ${submittedOtp.length}`);
    
    if (!storedOtp || storedOtp.length === 0) {
      console.log('No OTP stored for user');
      // Generate a new OTP for the user
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
    
    if (storedOtp !== submittedOtp) {
      console.log(`Invalid OTP. Expected: "${storedOtp}", Received: "${submittedOtp}"`);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid verification code. Please check and try again.' 
      });
    }
    
    const currentTime = Date.now();
    console.log(`Checking OTP expiry - Current: ${new Date(currentTime).toISOString()}, Expiry: ${new Date(user.verifyOtpExpireAt).toISOString()}`);
    
    if (currentTime > user.verifyOtpExpireAt) {
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
      isEmailVerified: true,
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
    
    // Generate a new token for the user
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7days' }
    );
    
    // Set cookie with permissive settings for mobile
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });
    
    console.log('Email verification successful');
    return res.json({
      success: true,
      token: token,
      userData: {
        id: user.id,
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
        isAccountVerified: true,
        isEmailVerified: true,
        isAdmin: user.isAdmin,
        profilePicture: user.profilePicture
      },
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Error in device-independent verification:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred during verification. Please try again.' 
    });
  }
});

// Add a new device-independent verification endpoint for resending verification emails
authRouter.post('/resend-verification-with-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    console.log(`Device-independent resend verification attempt for email: ${email}`);
    
    if (!email) {
      console.log('Missing email');
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide your email address' 
      });
    }
    
    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log(`User not found with email: ${email}`);
      return res.status(404).json({ 
        success: false, 
        message: 'User not found. Please check your email address.' 
      });
    }
    
    // Generate new OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes from now
    
    // Update user with new OTP
    await user.update({
      verifyOtp: newOtp,
      verifyOtpExpireAt: otpExpiry
    });
    
    // Send verification email
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
      
      return res.json({
        success: true,
        message: 'Verification email sent successfully'
      });
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email'
      });
    }
  } catch (error) {
    console.error('Error in device-independent resend verification:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Keep the original implementation as a fallback
authRouter.post('/auth-check', userAuth, checkAuth);

export default authRouter;