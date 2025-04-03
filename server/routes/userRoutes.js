import express from 'express';
import multer from 'multer';
import path from 'path';
import { getUserdata, updateProfile, getDashboardData, getUserDeposits, getUserTransactions } from '../controllers/userController.js';
import { submitMessage, getUserMessages } from '../controllers/contactController.js';
import userAuth from '../middleware/userAuth.js';
import { markMessageAsRead } from '../controllers/contactController.js';
import User from '../models/userModel.js';

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
userRouter.put('/update-profile', userAuth, upload.single('profileImage'), updateProfile);
userRouter.get('/dashboard', userAuth, getDashboardData);
userRouter.get('/deposits', userAuth, getUserDeposits);
userRouter.get('/transactions', userAuth, getUserTransactions);
userRouter.post('/contact', submitMessage);
userRouter.get('/messages', userAuth, getUserMessages);
userRouter.post('/mark-message-read', userAuth, markMessageAsRead);

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
    
    // Return the debug info
    res.json({
      success: true,
      debug: {
        profileImage: {
          value: profileImage,
          isValid: isValidPath(profileImage),
          fullUrl: profileImage && profileImage.startsWith('/uploads/') 
            ? `${req.protocol}://${req.get('host')}${profileImage}` 
            : profileImage
        },
        profilePicture: {
          value: profilePicture,
          isValid: isValidPath(profilePicture),
          fullUrl: profilePicture && profilePicture.startsWith('/uploads/') 
            ? `${req.protocol}://${req.get('host')}${profilePicture}` 
            : profilePicture
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