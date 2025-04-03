import express from 'express';
import multer from 'multer';
import path from 'path';
import { 
    getDashboardStats, getAllUsers, updateUserStatus, 
    getPendingDeposits, handleDeposit, getApprovedDeposits, 
    getPendingInvestments, handleInvestment, getApprovedInvestments, 
    getPendingWithdrawals, handleWithdrawal, getMessages, 
    markAsRead, replyToMessage, createUser, deleteUser, 
    updateUser, getRecentTransactions, getUserReferralCodes, 
    testEmail
} from '../controllers/adminController.js';
import adminAuth from '../middleware/adminAuth.js';
import { auditLogMiddleware } from '../middleware/auditLogMiddleware.js';

const adminRouter = express.Router();

// Configure multer for profile image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log('Upload destination for file:', file.originalname);
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = 'profile-' + uniqueSuffix + path.extname(file.originalname);
        console.log('Generated filename for upload:', filename);
        cb(null, filename);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        console.log('File upload details:', {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            mimetypeValid: mimetype,
            extnameValid: extname
        });
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});

// Apply middleware to all admin routes
adminRouter.use(auditLogMiddleware);

// Add this new route for the admin dashboard
adminRouter.get('/dashboard', adminAuth, async (req, res) => {
    res.json({
        success: true,
        message: "Welcome to Admin Dashboard"
    });
});

adminRouter.get('/stats', adminAuth, getDashboardStats);
adminRouter.get('/users', adminAuth, getAllUsers);
adminRouter.get('/users/referral-codes', adminAuth, getUserReferralCodes);
adminRouter.post('/update-user-status', adminAuth, updateUserStatus);
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
adminRouter.post('/users', adminAuth, upload.single('profileImage'), createUser);
adminRouter.delete('/users/:userId', adminAuth, deleteUser);
adminRouter.put('/users/:userId', adminAuth, upload.single('profileImage'), updateUser);
adminRouter.get('/transactions/recent', adminAuth, getRecentTransactions);
adminRouter.post('/test-email', adminAuth, testEmail);

export default adminRouter; 