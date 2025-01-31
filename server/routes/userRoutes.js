import express from 'express';
import { getUserdata, updateProfile, getDashboardData, getUserDeposits } from '../controllers/userController.js';
import { submitMessage, getUserMessages } from '../controllers/contactController.js';
import userAuth from '../middleware/userAuth.js';
import { markMessageAsRead } from '../controllers/contactController.js';

const userRouter = express.Router();

userRouter.get('/data', userAuth, getUserdata);
userRouter.put('/update-profile', userAuth, updateProfile);
userRouter.get('/dashboard', userAuth, getDashboardData);
userRouter.get('/deposits', userAuth, getUserDeposits);
userRouter.post('/contact', userAuth, submitMessage);
userRouter.get('/messages', userAuth, getUserMessages);
userRouter.post('/mark-message-read', userAuth, markMessageAsRead);

export default userRouter;