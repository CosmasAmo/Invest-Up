import express from 'express';
import multer from 'multer';
import path from 'path';
import { getUserdata, updateProfile, getDashboardData, getUserDeposits } from '../controllers/userController.js';
import { submitMessage, getUserMessages } from '../controllers/contactController.js';
import userAuth from '../middleware/userAuth.js';
import { markMessageAsRead } from '../controllers/contactController.js';

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
userRouter.post('/contact', submitMessage);
userRouter.get('/messages', userAuth, getUserMessages);
userRouter.post('/mark-message-read', userAuth, markMessageAsRead);

export default userRouter;