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
import { Op } from 'sequelize';

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
      const isExistingUser = req.user && req.user.googleId !== undefined && !req.user.isTemporary;
      
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
      let googleUser;
      
      // If we've got a proper user object with profile data
      if (req.user && req.user._json) {
        googleUser = req.user;
      } 
      // If we have a temporary user object
      else if (req.user && req.user.id) {
        // Use previous stored data or provide minimal data
        googleUser = {
          id: req.user.id,
          displayName: req.user.name || 'Google User',
          emails: [{ value: req.user.email || '' }],
          photos: req.user.profilePicture ? [{ value: req.user.profilePicture }] : []
        };
      }
      // Fallback if we have no user data at all
      else {
        console.error('No user data available in Google callback');
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=no_user_data`);
      }
      
      const email = googleUser.emails?.[0]?.value || googleUser._json?.email || googleUser.email || '';
      const name = googleUser.displayName || googleUser._json?.name || googleUser.name || '';
      const profilePicture = googleUser.photos?.[0]?.value || googleUser._json?.picture || googleUser.profilePicture || '';
      
      // Store temporary user data in session (if available)
      if (req.session) {
        req.session.tempUserData = {
          googleId: googleUser.id,
          email: email,
          name: name,
          profilePicture: profilePicture
        };
        try {
          // Save session explicitly, but don't wait for it to complete
          req.session.save(err => {
            if (err) {
              console.error('Error saving session:', err);
            } else {
              console.log('Session saved successfully');
            }
          });
        } catch (sessionError) {
          console.error('Error saving session:', sessionError);
          // Continue even if session save fails
        }
      } else {
        console.log('No session available, proceeding without session storage');
      }

      // Create a temporary JWT token
      const token = jwt.sign(
        { 
          id: googleUser.id,
          email: email,
          name: name,
          profilePicture: profilePicture,
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
      const { name: formName, password, referralCode } = req.body;
      
      if (!formName || !password) {
        return res.status(400).json({
          success: false,
          message: 'Name and password are required'
        });
      }
      
      // Get user info from the token
      const { id: googleId, email, name: tokenName, profilePicture: tokenProfilePic } = req.user;
      
      if (!googleId || !email) {
        return res.status(400).json({
          success: false,
          message: 'Missing user data in token'
        });
      }
      
      console.log('Processing complete-google-profile for Google ID:', googleId);
      console.log('User email from token:', email);
      
      // Gather user data from multiple sources (prioritize form data > token > session)
      let tempUserData = {
        googleId: googleId,
        email: email,
        name: formName || tokenName || 'Google User',
        profilePicture: tokenProfilePic || ''
      };
      
      // Check if we have additional data from session
      if (req.session && req.session.tempUserData) {
        const sessionData = req.session.tempUserData;
        // Only override with session data if it matches the same Google user
        if (sessionData.googleId === googleId) {
          // Use session data for any fields that aren't already set
          if (!tempUserData.profilePicture && sessionData.profilePicture) {
            tempUserData.profilePicture = sessionData.profilePicture;
          }
          console.log('Enhanced user data with session information');
        }
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // First, check if user already exists with this email
      let existingUser = null;
      try {
        existingUser = await User.findOne({ 
          where: { 
            [Op.or]: [
              { email: tempUserData.email },
              { googleId: tempUserData.googleId }
            ]
          }
        });
      } catch (dbError) {
        console.error('Database error when searching for existing user:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Database error occurred',
          error: dbError.message
        });
      }

      let user;

      if (existingUser) {
        console.log(`User with email ${tempUserData.email} or Google ID ${tempUserData.googleId} already exists, updating instead`);
        
        // Handle referral if code is provided and user doesn't already have a referrer
        if (referralCode && !existingUser.referredBy) {
          try {
            const referrer = await User.findOne({ where: { referralCode } });
            if (referrer && referrer.id !== existingUser.id) { // Make sure user isn't referring themselves
              await existingUser.update({ referredBy: referrer.id });
              // Increment referral count for the referring user
              await referrer.increment('referralCount');
              console.log(`Incremented referral count for user: ${referrer.id}`);
            }
          } catch (referralError) {
            console.error('Error handling referral:', referralError);
            // Continue even if referral update fails
          }
        }

        // Update existing user with Google info
        try {
          await existingUser.update({
            googleId: tempUserData.googleId,
            name: name,
            password: hashedPassword,
            isEmailVerified: true,
            isAccountVerified: true
          });
          user = existingUser;
        } catch (updateError) {
          console.error('Error updating existing user:', updateError);
          return res.status(500).json({
            success: false,
            message: 'Error updating user information',
            error: updateError.message
          });
        }
      } else {
        console.log('Creating new user from Google profile');
        
        // Handle referral if code is provided
        let referredBy = null;
        if (referralCode) {
          try {
            const referrer = await User.findOne({ where: { referralCode } });
            if (referrer) {
              referredBy = referrer.id;
              // Increment referral count for the referring user
              await referrer.increment('referralCount');
              console.log(`Incremented referral count for user: ${referrer.id}`);
            }
          } catch (referralError) {
            console.error('Error handling referral for new user:', referralError);
            // Continue even if referral fails
          }
        }

        // Create new user with complete profile
        try {
          // Double check that required fields are provided
          if (!tempUserData.email) {
            throw new Error('Email is required for user creation');
          }
          if (!tempUserData.googleId) {
            throw new Error('Google ID is required for user creation');
          }
          if (!hashedPassword) {
            throw new Error('Password is required for user creation');
          }
          
          // Double check name exists, fallback to a default if somehow missing
          const name = formName || tempUserData.name || 'Google User';
          
          // Generate unique referral code securely
          const uniqueReferralCode = crypto.randomBytes(4).toString('hex');
          
          console.log('Attempting to create user with:', {
            googleId: tempUserData.googleId,
            email: tempUserData.email,
            name: name,
            hasPassword: true,
            referralCode: uniqueReferralCode,
            referredBy: referredBy ? 'exists' : 'none'
          });
          
          user = await User.create({
            googleId: tempUserData.googleId,
            email: tempUserData.email,
            name: name,
            password: hashedPassword,
            isEmailVerified: true, // Google email is already verified
            isAccountVerified: true,
            profilePicture: tempUserData.profilePicture, // Use the profile picture from Google if available
            referralCode: uniqueReferralCode,
            referredBy,
            referralCount: 0,
            referralEarnings: 0.00,
            balance: 0.00
          });
          
          console.log('User created successfully with ID:', user.id);
        } catch (createError) {
          console.error('Error creating new user:', createError);
          return res.status(500).json({
            success: false,
            message: 'Error creating new user account: ' + createError.message
          });
        }
      }

      // Handle profile image upload if provided
      if (req.file) {
        try {
          console.log('Processing profile image upload...');
          
          // Log file details
          console.log('File details:', {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
          });
          
          // Validate file has buffer
          if (!req.file.buffer || req.file.buffer.length === 0) {
            console.error('Error: File buffer is empty or missing');
            // Continue without image upload
          } else {
            // Convert buffer to base64
            const b64 = Buffer.from(req.file.buffer).toString('base64');
            const dataURI = `data:${req.file.mimetype};base64,${b64}`;
            
            // Check Cloudinary configuration
            if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
              console.error('Missing Cloudinary credentials in environment variables');
              // Continue without image upload
            } else {
              // Upload to Cloudinary
              console.log('Uploading to Cloudinary...');
              const uploadResult = await cloudinary.uploader.upload(dataURI, {
                folder: 'profile_pictures',
                resource_type: 'auto'
              });
              
              console.log('Cloudinary upload successful, URL:', uploadResult.secure_url);
              
              // Update user with profile image
              await user.update({ profilePicture: uploadResult.secure_url });
              console.log('User profile picture updated successfully');
            }
          }
        } catch (uploadError) {
          console.error('Error uploading profile image:', uploadError);
          // Continue even if image upload fails
        }
      }

      // Clear temporary user data from session if it exists
      if (req.session && req.session.tempUserData) {
        delete req.session.tempUserData;
        try {
          req.session.save();
        } catch (sessionError) {
          console.error('Error clearing session data:', sessionError);
          // Continue even if session update fails
        }
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
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin || false,
          isAccountVerified: true,
          isEmailVerified: true,
          profilePicture: user.profilePicture,
          referralCode: user.referralCode
        },
        message: 'Profile completed successfully' 
      });
    } catch (error) {
      console.error('Complete profile error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while completing your profile',
        error: error.message
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

authRouter.get('/test', (req, res) => {
  res.json({ message: "Auth router is working!" });
});

export default authRouter;