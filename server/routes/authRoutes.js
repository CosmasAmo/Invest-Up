import express from 'express';
import {isAuthenticated, register, resetPassword, sendResetOtp, verifyEmail, registerWithReferral, checkAuth} from '../controllers/authController.js';
import {login} from '../controllers/authController.js';
import {logout} from '../controllers/authController.js';
import userAuth from '../middleware/userAuth.js';
import passport from '../config/googleAuth.js';
import jwt from 'jsonwebtoken';
import upload from '../middleware/fileUpload.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import User from '../models/userModel.js';
import cloudinary from '../config/cloudinary.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const authRouter = express.Router();

authRouter.post('/register', upload.single('profileImage'), register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/verify-account', userAuth, verifyEmail);
authRouter.post('/is-auth', userAuth, isAuthenticated);
authRouter.post('/send-reset-otp', sendResetOtp);
authRouter.post('/reset-password', resetPassword);
authRouter.post('/register-with-referral', registerWithReferral);
authRouter.get('/check', checkAuth);

authRouter.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

authRouter.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      // Log the user object structure to help debug
      console.log('Google user profile:', JSON.stringify(req.user));
      
      // Check if user is a database user (has googleId set) or just a profile object
      const isExistingUser = req.user.googleId !== undefined;
      
      if (isExistingUser) {
        // For existing users, create a regular login token
        const token = jwt.sign(
          { 
            id: req.user.id,
            email: req.user.email,
            isTempUser: false
          },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );
        
        // Set token cookie for server-side auth
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        
        // Redirect directly to dashboard with token for client-side auth
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard?token=${token}`);
      }
      
      // For new users, continue with the profile completion flow
      // Extract email and other info safely with fallbacks
      const email = req.user.emails?.[0]?.value || req.user.email || '';
      const name = req.user.displayName || req.user.name || '';
      const profilePicture = req.user.photos?.[0]?.value || req.user.picture || '';
      
      // Store temporary user data in session
      if (!req.session) {
        console.error('Session not available');
      } else {
        req.session.tempUserData = {
          googleId: req.user.id,
          email: email,
          name: name,
          profilePicture: profilePicture
        };
        // Save session explicitly
        req.session.save(err => {
          if (err) {
            console.error('Error saving session:', err);
          } else {
            console.log('Session saved successfully');
          }
        });
      }

      // Create a temporary JWT token
      const token = jwt.sign(
        { 
          id: req.user.id,
          email: email,
          isTempUser: true
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Redirect to complete profile page with token
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/complete-profile?token=${token}`);
    } catch (error) {
      console.error('Google auth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=google_auth_failed`);
    }
  }
);

// Add new route to complete Google profile
authRouter.post('/complete-google-profile',
  authenticateToken,
  upload.single('profileImage'),
  async (req, res) => {
    try {
      const { name, password, referralCode } = req.body;
      
      if (!name || !password) {
        return res.status(400).json({
          success: false,
          message: 'Name and password are required'
        });
      }
      
      // Get user info from the token
      const { id: googleId, email } = req.user;
      
      // Check if we have a temp user from session
      let tempUserData = null;
      if (req.session && req.session.tempUserData) {
        tempUserData = req.session.tempUserData;
        console.log('Using session data:', tempUserData);
      } else {
        // If no session data, use token data
        tempUserData = {
          googleId,
          email,
          name: name || '',
          profilePicture: ''
        };
        console.log('Using token data:', tempUserData);
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // First, check if user already exists with this email
      const existingUser = await User.findOne({ 
        where: { email: tempUserData.email || email }
      });

      let user;

      if (existingUser) {
        console.log(`User with email ${tempUserData.email || email} already exists, updating instead`);
        
        // Handle referral if code is provided and user doesn't already have a referrer
        if (referralCode && !existingUser.referredBy) {
          const referrer = await User.findOne({ where: { referralCode } });
          if (referrer && referrer.id !== existingUser.id) { // Make sure user isn't referring themselves
            await existingUser.update({ referredBy: referrer.id });
            // Increment referral count for the referring user
            await referrer.increment('referralCount');
            console.log(`Incremented referral count for user: ${referrer.id}`);
          }
        }

        // Update existing user with Google info
        await existingUser.update({
          googleId: tempUserData.googleId || googleId,
          name: name,
          password: hashedPassword,
          isEmailVerified: true,
          isAccountVerified: true
        });

        user = existingUser;
      } else {
        // Handle referral if code is provided
        let referredBy = null;
        if (referralCode) {
          const referrer = await User.findOne({ where: { referralCode } });
          if (referrer) {
            referredBy = referrer.id;
            // Increment referral count for the referring user
            await referrer.increment('referralCount');
            console.log(`Incremented referral count for user: ${referrer.id}`);
          }
        }

        // Generate unique referral code for new user
        const uniqueReferralCode = crypto.randomBytes(4).toString('hex');

        // Create new user with complete profile
        user = await User.create({
          googleId: tempUserData.googleId || googleId,
          email: tempUserData.email || email,
          name: name,
          password: hashedPassword,
          isEmailVerified: true, // Google email is already verified
          profilePicture: tempUserData.profilePicture || '',
          referralCode: uniqueReferralCode,
          referredBy,
          referralCount: 0,
          referralEarnings: 0.00,
          balance: 0.00,
          isAccountVerified: true
        });
      }

      // Handle profile image upload if provided
      if (req.file) {
        // Convert buffer to base64
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;
        
        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(dataURI, {
          folder: 'profile_pictures',
          resource_type: 'auto'
        });
        
        // Update user with profile image
        await user.update({ profilePicture: uploadResult.secure_url });
      }

      // Clear temporary user data from session if it exists
      if (req.session && req.session.tempUserData) {
        delete req.session.tempUserData;
        req.session.save();
      }

      // Create new JWT token for the complete user
      const token = jwt.sign(
        { 
          id: user.id,
          email: user.email,
          isTempUser: false
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({ 
        success: true, 
        token,
        message: 'Profile completed successfully' 
      });
    } catch (error) {
      console.error('Complete profile error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to complete profile: ' + error.message 
      });
    }
  }
);

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

export default authRouter;