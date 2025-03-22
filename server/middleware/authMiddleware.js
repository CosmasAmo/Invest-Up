import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

// Middleware to check if user is authenticated
export const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        
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
  // Try to get token from Authorization header
  const authHeader = req.headers['authorization'];
  let token;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } 
  // If no token in header, try from cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    // Check if this is a temporary user
    if (user.isTempUser) {
      req.user = user;
      return next();
    }

    // For complete users, verify they exist in the database
    try {
      const dbUser = await User.findByPk(user.id);
      if (!dbUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      req.user = dbUser;
      next();
    } catch (error) {
      return res.status(500).json({ message: 'Server error' });
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