import express from 'express';
import { getSettings, updateSettings, getPublicSettings } from '../controllers/settingsController.js';
import { isAuthenticated, isAdmin } from '../middleware/authMiddleware.js';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const router = express.Router();

// Custom middleware that combines authentication and admin check in one flow
// This helps avoid issues with cascading middleware
const isAuthenticatedAdmin = async (req, res, next) => {
  try {
    // Get token from cookies or Authorization header
    let token = req.cookies.token;
    
    // Check Authorization header if no cookie token
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
        console.log('Admin check using token from Authorization header');
      }
    }
    
    if (!token) {
      console.log('No authentication token found in request', { 
        cookies: Object.keys(req.cookies || {}),
        hasAuthHeader: !!req.headers.authorization,
        authHeader: req.headers.authorization ? req.headers.authorization.substring(0, 15) + '...' : 'none'
      });
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required. Please log in.' 
      });
    }

    // Verify token and get user
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully, user ID:', decoded.id);
      
      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        console.log(`User with ID ${decoded.id} not found in database`);
        return res.status(401).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
      
      // Check if user is admin
      if (!user.isAdmin) {
        console.log(`User ${user.id} attempted admin access but is not an admin`);
        return res.status(403).json({ 
          success: false, 
          message: 'Admin access required' 
        });
      }
      
      console.log(`Admin user ${user.id} authenticated successfully`);
      // User is authenticated and is an admin
      req.userId = user.id;
      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError.message);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    console.error('Admin authentication error:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

// Public route to get limited settings - accessible to everyone
router.get('/public', getPublicSettings);

// Handle OPTIONS preflight requests for public endpoint
router.options('/public', (req, res) => {
  const origin = req.headers.origin;
  
  // Set CORS headers
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Respond to preflight request with 204 No Content
  res.status(204).end();
});

// Simple test endpoint - no authentication required
router.get('/test', (req, res) => {
  console.log('Settings test endpoint called');
  res.setHeader('Content-Type', 'application/json');
  res.json({
    success: true,
    message: 'Settings API is working',
    timestamp: new Date().toISOString()
  });
});

// Get all settings - accessible to all authenticated users
router.get('/', isAuthenticated, getSettings);

// Update settings - only accessible to admins
router.post('/update', isAuthenticatedAdmin, updateSettings);

// Test endpoint for checking API connectivity
router.get('/test', (req, res) => {
  try {
    // Get token from cookies or Authorization header
    let token = req.cookies.token;
    
    // Check Authorization header if no cookie token
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    // Return status info about the request
    return res.json({
      success: true,
      message: 'Settings API is accessible',
      hasToken: !!token,
      tokenStart: token ? token.substring(0, 10) + '...' : null,
      cookies: Object.keys(req.cookies || {}),
      hasAuthHeader: !!req.headers.authorization,
      authHeaderStart: req.headers.authorization ? req.headers.authorization.substring(0, 15) + '...' : null
    });
  } catch (error) {
    console.error('Error in settings test endpoint:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

export default router; 