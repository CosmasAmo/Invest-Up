import express from 'express';
import { getDashboardStats, getAllUsers, updateUserStatus, getPendingDeposits, handleDeposit, getApprovedDeposits, getPendingInvestments, handleInvestment, getApprovedInvestments, getPendingWithdrawals, handleWithdrawal, getMessages, markAsRead, replyToMessage } from '../controllers/adminController.js';
import adminAuth from '../middleware/adminAuth.js';
import auditLogger from '../middleware/auditLogger.js';

const adminRouter = express.Router();

// Add this new route for the admin dashboard
adminRouter.get('/dashboard', adminAuth, async (req, res) => {
    res.json({
        success: true,
        message: "Welcome to Admin Dashboard"
    });
});

adminRouter.get('/stats', adminAuth, auditLogger, getDashboardStats);
adminRouter.get('/users', adminAuth, auditLogger, getAllUsers);
adminRouter.post('/update-user-status', adminAuth, auditLogger, updateUserStatus);
adminRouter.get('/pending-deposits', adminAuth, getPendingDeposits);
adminRouter.post('/handle-deposit', adminAuth, handleDeposit);
adminRouter.get('/approved-deposits', adminAuth, getApprovedDeposits);
adminRouter.get('/pending-investments', adminAuth, getPendingInvestments);
adminRouter.post('/handle-investment', adminAuth, handleInvestment);
adminRouter.get('/approved-investments', adminAuth, getApprovedInvestments);
adminRouter.get('/pending-withdrawals', adminAuth, getPendingWithdrawals);
adminRouter.post('/handle-withdrawal', adminAuth, handleWithdrawal);
adminRouter.get('/messages', adminAuth, getMessages);
adminRouter.post('/mark-message-read', adminAuth, markAsRead);
adminRouter.post('/reply-message', adminAuth, replyToMessage);

export default adminRouter; 