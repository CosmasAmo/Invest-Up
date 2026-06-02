import express from 'express';
import {register, resetPassword, sendResetOtp, verifyResetOtp, verifyEmail, registerWithReferral, checkAuth} from '../controllers/authController.js';
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
    
    // Handle temporary/Google tokens
    if (decoded.isTemporary || decoded.isTempUser) {
      console.log('Temporary user token detected in is-auth endpoint');
      return res.json({
        success: true,
        user: {
          id: decoded.googleId || decoded.id,
          email: decoded.email,
          isTemporary: true,
          googleId: decoded.googleId,
          isAccountVerified: decoded.isAccountVerified || true,
        }
      });
    }
    
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
        googleId: user.googleId || null,
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

// Fixed: Use root-level routes instead of /google since this router is already mounted at /api/auth
authRouter.get('/', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// Google authentication routes
authRouter.get('/google', 
  (req, res, next) => {
    console.log('Initiating Google OAuth flow');
    console.log('Query parameters:', req.query);
    
    // Store any state, timestamp and client_url parameters
    if (req.query.state) {
      req.session.oauthState = req.query.state;
    }
    if (req.query.client_url) {
      req.session.clientUrl = req.query.client_url;
    }
    
    // Clear any existing session data to prevent conflicts
    if (req.session.passport) {
      console.log('Clearing existing passport session to ensure fresh login');
      delete req.session.passport;
    }
    
    next();
  },
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    // Always force the account selection screen to appear
    prompt: 'select_account',
    accessType: 'online'
  })
);

authRouter.get('/google/callback', 
  (req, res, next) => {
    console.log('Google OAuth callback received');
    
    // Clear any existing session data to prevent conflicts
    if (req.session && req.session.passport) {
      console.log('Clearing existing passport session data in callback to prevent conflicts');
      // Don't delete the entire session, just the passport part to avoid race conditions
      delete req.session.passport;
    }
    
    next();
  },
  passport.authenticate('google', { 
    failureRedirect: process.env.CLIENT_URL ? `${process.env.CLIENT_URL}/login?error=google_auth_failed` : 'http://localhost:5173/login?error=google_auth_failed'
  }),
  async (req, res) => {
    try {
      console.log('Google authentication successful:', {
        userId: req.user?.id,
        isTemporary: req.user?.isTemporary,
        email: req.user?.email
      });

      // Add a timestamp to prevent caching issues
      const timestamp = new Date().getTime();

      if (req.user.isTemporary) {
        // Generate temporary token to secure the profile completion process
        const temporaryToken = jwt.sign(
          { 
            googleId: req.user.id,
            email: req.user.emails?.[0]?.value,
            isTemporary: true,
            isAccountVerified: true // Mark Google users as verified
          },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );
        
        // Redirect to profile completion page with token
        return res.redirect(`${process.env.CLIENT_URL}/complete-profile?token=${temporaryToken}&googleId=${req.user.id}&email=${req.user.emails[0].value}&t=${timestamp}`);
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: req.user.id,
          email: req.user.email,
          role: req.user.role,
          isAccountVerified: true // Mark Google users as verified
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Set secure cookie with token
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      // Redirect to dashboard with token in URL for client-side storage and timestamp to prevent caching
      res.redirect(`${process.env.CLIENT_URL}/dashboard?token=${token}&t=${timestamp}`);
    } catch (error) {
      console.error('Error in Google callback:', {
        error: error.message,
        stack: error.stack
      });
      res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed&t=${new Date().getTime()}`);
    }
  }
);

// Add a route to handle profile completion
authRouter.post('/complete-profile', async (req, res) => {
  try {
    const { googleId, email, name, phone } = req.body;

    console.log('Profile completion request received:', { 
      googleId, 
      email, 
      name: name ? 'provided' : 'missing', 
      phone: phone ? 'provided' : 'missing'
    });

    if (!googleId || !email) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required profile information'
      });
    }

    // Create new user
    const newUser = await User.create({
      googleId,
      email,
      name: name || email.split('@')[0],
      phoneNumber: phone || '',
      isAccountVerified: true, // Google users are already verified
      role: 'user'
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: newUser.id,
        email: newUser.email,
        isTempUser: false,
        role: newUser.role,
        isAccountVerified: true // Explicitly include isAccountVerified in token
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Also set the token in a cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        phoneNumber: newUser.phoneNumber,
        role: newUser.role,
        isAccountVerified: true
      }
    });
  } catch (error) {
    console.error('Error completing profile:', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Failed to complete profile setup'
    });
  }
});

authRouter.get('/google', (req, res, next) => {
    // Set CORS headers for Google auth endpoint
    const origin = req.headers.origin;
    if (origin && (origin.includes('localhost') || origin.includes('investuptrading.com'))) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    
    // Store client URL and auth type in session for use in callback
    if (req.query.client_url) {
        req.session.clientRedirectUrl = decodeURIComponent(req.query.client_url);
        console.log(`Storing client URL for redirect: ${req.session.clientRedirectUrl}`);
    }
    
    if (req.query.auth_type) {
        req.session.authType = req.query.auth_type;
        console.log(`Auth type: ${req.session.authType}`);
    }
    
    // Store state parameter if provided
    if (req.query.state) {
        req.session.oauthState = req.query.state;
        console.log(`State parameter stored: ${req.session.oauthState}`);
    }
    
    next();
}, passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
    accessType: 'online'
}));

authRouter.get('/google/callback', (req, res, next) => {
    // Set CORS headers for Google callback endpoint
    const origin = req.headers.origin;
    if (origin && (origin.includes('localhost') || origin.includes('investuptrading.com'))) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    next();
}, passport.authenticate('google', { failureRedirect: process.env.CLIENT_URL ? `${process.env.CLIENT_URL}/login?error=google_auth_failed` : 'http://localhost:5173/login?error=google_auth_failed' }), async (req, res) => {
    try {
        // Log the user object structure to help debug
        console.log('Google user profile:', JSON.stringify(req.user));
        
        // Get client URL from session or use default
        const clientUrl = req.session?.clientRedirectUrl || process.env.CLIENT_URL || 'http://localhost:5173';
        console.log(`Using client URL for redirect: ${clientUrl}`);
        
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
            
            // Set token cookie for server-side auth with appropriate options
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
            
            // Redirect directly to dashboard with token for client-side auth
            return res.redirect(`${clientUrl}/dashboard?token=${token}`);
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
            return res.redirect(`${clientUrl}/login?error=no_user_data`);
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

        // Set token in cookie for consistent authentication
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 60 * 60 * 1000 // 1 hour
        });

        // Redirect to complete profile page with token and necessary params
        // This ensures both old and new implementations work
        res.redirect(`${clientUrl}/complete-profile?token=${token}&googleId=${googleUser.id}&email=${encodeURIComponent(email)}`);
    } catch (error) {
        console.error('Google authentication error:', error);
        // Get client URL from session or use default
        const clientUrl = req.session?.clientRedirectUrl || process.env.CLIENT_URL || 'http://localhost:5173';
        res.redirect(`${clientUrl}/login?error=auth_failed`);
    }
});

// Add new route to complete Google profile
authRouter.post('/complete-google-profile',
  // Add logging middleware for debugging
  (req, res, next) => {
    console.log('=== GOOGLE PROFILE COMPLETION DEBUGGING ===');
    console.log('Headers:', {
      contentType: req.headers['content-type'],
      authorization: req.headers.authorization ? 'Bearer xxx...' : 'Not provided',
      origin: req.headers.origin || 'Not provided'
    });
    console.log('Body keys:', Object.keys(req.body));
    console.log('Files:', req.files ? 'Present' : 'Not present');
    console.log('URL:', req.url);
    console.log('Method:', req.method);
    console.log('Path:', req.path);
    next();
  },
  authenticateToken,
  upload.single('profileImage'),
  async (req, res) => {
    try {
      console.log('Complete-google-profile handler reached');
      const { name: formName, password, referralCode } = req.body;
      
      if (!formName || !password) {
        return res.status(400).json({
          success: false,
          message: 'Name and password are required'
        });
      }
      
      // Get user info from the token
      const { id, googleId, email, name: tokenName, profilePicture: tokenProfilePic } = req.user || {};
      
      // Use googleId from token or use id as fallback
      const userGoogleId = googleId || id;
      
      if (!userGoogleId || !email) {
        console.log('Missing user data in token:', req.user);
        return res.status(400).json({
          success: false,
          message: 'Missing user data in token'
        });
      }
      
      console.log('Processing complete-google-profile for Google ID:', userGoogleId);
      console.log('User email from token:', email);
      
      // Gather user data from multiple sources (prioritize form data > token > session)
      let tempUserData = {
        googleId: userGoogleId,
        email: email,
        name: formName || tokenName || 'Google User',
        profilePicture: tokenProfilePic || ''
      };
      
      // Check if we have additional data from session
      if (req.session && req.session.tempUserData) {
        const sessionData = req.session.tempUserData;
        // Only override with session data if it matches the same Google user
        if (sessionData.googleId === userGoogleId) {
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
              // Increment referral count only if user is already verified (signup completed)
              if (existingUser.isAccountVerified) {
                await referrer.increment('referralCount');
                await referrer.reload();
                console.log(`Incremented referral count for user: ${referrer.id} (existing verified user)`);
              } else {
                console.log(`User ${existingUser.id} not yet verified, referral count will increment after verification`);
              }
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
              // Referral count will be incremented after user creation since Google users are already verified
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
          
          // Increment referral count for the referrer since Google users are already verified on signup
          if (user.referredBy) {
            try {
              console.log(`Google user ${user.id} completed signup, incrementing referral count for referrer ${user.referredBy}`);
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
              // Don't fail user creation if referral count increment fails
            }
          }
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

// Add a debug endpoint to test token authentication for Google profile
authRouter.get('/debug-google-token', authenticateToken, (req, res) => {
  try {
    console.log('Debug Google token authentication test');
    console.log('User from token:', req.user);
    
    // Return user data from the token
    res.json({
      success: true,
      message: 'Token is valid',
      user: {
        id: req.user.id || req.user.googleId,
        googleId: req.user.googleId,
        email: req.user.email,
        isTemporary: req.user.isTemporary || req.user.isTempUser || false,
        isAccountVerified: req.user.isAccountVerified || true, // Google users are automatically verified
        tokenType: req.user.isTemporary ? 'Google temporary token' : 'Regular user token'
      }
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing token',
      error: error.message
    });
  }
});

// Keep the original implementation as a fallback
authRouter.post('/auth-check', userAuth, checkAuth);

export default authRouter;