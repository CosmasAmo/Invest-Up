import express from 'express';
import multer from 'multer';
import path from 'path';
import { getUserdata, updateProfile, getDashboardData, getUserDeposits, getUserTransactions, getUserStats } from '../controllers/userController.js';
import { submitMessage, getUserMessages } from '../controllers/contactController.js';
import userAuth from '../middleware/userAuth.js';
import { markMessageAsRead } from '../controllers/contactController.js';
import User from '../models/userModel.js';
import { getWithdrawalHistory } from '../controllers/withdrawalController.js';
import { getUserInvestments } from '../controllers/investmentController.js';
import fs from 'fs';

const userRouter = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed!"));
  }
});

userRouter.get('/data', userAuth, getUserdata);
userRouter.put('/profile', userAuth, upload.single('profileImage'), updateProfile);
userRouter.get('/dashboard', userAuth, getDashboardData);
userRouter.get('/deposits', userAuth, getUserDeposits);

// Add OPTIONS handler for contact route to handle preflight requests
userRouter.options('/contact', (req, res) => {
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

userRouter.post('/contact', submitMessage);
userRouter.get('/messages', userAuth, getUserMessages);
userRouter.post('/messages/:messageId/read', userAuth, markMessageAsRead);

userRouter.get('/transactions', userAuth, getUserTransactions);
userRouter.get('/investments', userAuth, getUserInvestments);
userRouter.get('/stats', userAuth, getUserStats);
userRouter.get('/withdrawals', userAuth, getWithdrawalHistory);

// Add endpoint that matches the client-side call to /api/user/profile
userRouter.get('/profile', userAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Return the same data structure as getUserdata but with a simpler response
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
        balance: user.balance,
        totalProfit: user.totalProfit,
        totalDeposit: user.totalDeposit,
        totalWithdrawal: user.totalWithdrawal,
        referralCode: user.referralCode,
        referralCount: user.referralCount,
        referralBonus: user.referralBonus,
        isAccountVerified: user.isAccountVerified,
        createdAt: user.createdAt,
        profileImage: user.profileImage,
        profilePicture: user.profilePicture,
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ success: false, message: 'Error fetching user profile' });
  }
});

// Add test endpoint to check user's profile image
userRouter.get('/debug-profile-image', userAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }
    
    // Get the image paths
    const profileImage = user.profileImage;
    const profilePicture = user.profilePicture;
    
    // Check if paths are valid
    const isValidPath = (path) => {
      return path && (
        path.startsWith('http://') || 
        path.startsWith('https://') || 
        path.startsWith('/uploads/')
      );
    };
    
    // Check if file exists on server (only for local uploads)
    const checkFileExists = (path) => {
      if (!path || !path.startsWith('/uploads/')) {
        return { exists: false, checked: false };
      }
      
      try {
        const filePath = path.replace('/uploads/', '');
        const fullPath = `${__dirname}/../uploads/${filePath}`;
        const exists = fs.existsSync(fullPath);
        return { exists, checked: true, fullPath };
      } catch (error) {
        return { exists: false, checked: true, error: error.message };
      }
    };
    
    // Return the debug info
    res.json({
      success: true,
      debug: {
        profileImage: {
          value: profileImage,
          isValid: isValidPath(profileImage),
          fullUrl: profileImage && profileImage.startsWith('/uploads/') 
            ? `${req.protocol}://${req.get('host')}${profileImage}` 
            : profileImage,
          fileCheck: checkFileExists(profileImage)
        },
        profilePicture: {
          value: profilePicture,
          isValid: isValidPath(profilePicture),
          fullUrl: profilePicture && profilePicture.startsWith('/uploads/') 
            ? `${req.protocol}://${req.get('host')}${profilePicture}` 
            : profilePicture,
          fileCheck: checkFileExists(profilePicture)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add test endpoint for debugging images
userRouter.get('/debug-image-paths', userAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }
    
    // Construct paths in different formats for testing
    const serverUrl = `${req.protocol}://${req.get('host')}`;
    const filename = user.profileImage ? user.profileImage.split('/').pop() : 'sample.jpg';
    
    const testPaths = {
      clientSideUrl: `/uploads/${filename}`,                      // Client-side relative URL
      fullRelativeUrl: `/uploads/${filename}`,                    // Relative URL with leading slash
      serverRelativeUrl: `/uploads/${filename}`,                  // Server-side relative URL
      absoluteUrl: `${serverUrl}/uploads/${filename}`,            // Absolute URL with server address
      absoluteClientUrl: `https://investuptrading.com/uploads/${filename}` // Absolute client URL - incorrect
    };
    
    res.json({
      success: true,
      debug: {
        user: {
          profileImage: user.profileImage,
          profilePicture: user.profilePicture,
        },
        serverUrl,
        testPaths,
        whichShouldWork: "The absoluteUrl path should work correctly across all environments."
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default userRouter;