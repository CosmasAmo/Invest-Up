import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

// Middleware to check if user is authenticated
export const isAuthenticated = async (req, res, next) => {
    try {
        // Get token from cookies or Authorization header
        let token = req.cookies.token;
        
        // Check Authorization header if no cookie token
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
                console.log('Using token from Authorization header');
            }
        }
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        // Add user ID to request object
        req.userId = user.id;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

// Middleware to check if user is an admin
export const isAdmin = async (req, res, next) => {
    try {
        const userId = req.userId;
        
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }
        
        const user = await User.findByPk(userId);
        
        if (!user || !user.isAdmin) {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }
        
        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const authenticateToken = (req, res, next) => {
  console.log('=== AUTHENTICATE TOKEN MIDDLEWARE ===');
  console.log(`Request path: ${req.originalUrl}`);
  
  // Try to get token from Authorization header
  const authHeader = req.headers['authorization'];
  let token;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
    console.log('Token found in Authorization header');
    console.log('Token length:', token.length);
    console.log('Token prefix:', token.substring(0, 10) + '...');
  } 
  // If no token in header, try from cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
    console.log('Token found in cookies');
  }

  if (!token) {
    console.log('No token found in request');
    return res.status(401).json({ 
      success: false,
      message: 'Authentication required' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      console.error('Token verification error:', err.message);
      return res.status(403).json({ 
        success: false,
        message: 'Invalid or expired token' 
      });
    }

    console.log('Token successfully verified');
    console.log('Decoded user:', {
      id: user.id,
      email: user.email,
      isTempUser: user.isTempUser || false,
      googleId: user.googleId || 'Not provided',
      isTemporary: user.isTemporary || false
    });

    // Check if this is a temporary user from Google auth flow
    if (user.isTempUser || user.isTemporary) {
      console.log('Temporary user found in token');
      
      // Make sure we have the minimum required fields
      if (!user.email) {
        console.error('Email missing from temporary token');
        return res.status(400).json({
          success: false,
          message: 'Invalid token data: missing email'
        });
      }
      
      req.user = {
        id: user.id || user.googleId, // Make sure we have at least one identifier
        googleId: user.googleId || user.id, // Use either as fallback
        email: user.email,
        isTemporary: true,
        isTempUser: true,
        isAccountVerified: true, // Google users are automatically verified
        name: user.name || user.email.split('@')[0]
      };
      
      return next();
    }

    // For complete users, verify they exist in the database
    try {
      const dbUser = await User.findByPk(user.id);
      if (!dbUser) {
        console.log(`User with ID ${user.id} not found in database`);
        return res.status(404).json({ 
          success: false,
          message: 'User not found' 
        });
      }
      console.log(`User ${dbUser.id} found in database`);
      req.user = dbUser;
      next();
    } catch (error) {
      console.error('Database error:', error.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  });
};

// Middleware to check if user has completed their profile
export const requireCompleteProfile = (req, res, next) => {
  if (req.user.isTempUser) {
    return res.status(403).json({ 
      message: 'Please complete your profile first',
      redirectTo: '/complete-profile'
    });
  }
  next();
}; 