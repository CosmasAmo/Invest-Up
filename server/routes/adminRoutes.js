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
    testEmail,
    broadcastMessage
} from '../controllers/adminController.js';
import adminAuth from '../middleware/adminAuth.js';
import { auditLogMiddleware } from '../middleware/auditLogMiddleware.js';
import { calculateAndUpdateProfits } from '../services/profitService.js';
import User from '../models/userModel.js';
import crypto from 'crypto';

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

// Add route for updating profit calculation interval
adminRouter.post('/update-profit-interval', (req, res) => {
    try {
        // Import and call the setup function from server.js
        import('../server.js').then(serverModule => {
            if (typeof serverModule.setupProfitCalculationInterval === 'function') {
                serverModule.setupProfitCalculationInterval();
                res.json({
                    success: true,
                    message: 'Profit calculation interval updated successfully'
                });
            } else {
                throw new Error('setupProfitCalculationInterval function not found');
            }
        }).catch(error => {
            console.error('Error importing server module:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update profit calculation interval',
                error: error.message
            });
        });
    } catch (error) {
        console.error('Error updating profit calculation interval:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profit calculation interval',
            error: error.message
        });
    }
});

// Add route for manually triggering profit calculation
adminRouter.post('/trigger-profit-calculation', adminAuth, async (req, res) => {
    try {
        console.log('Manually triggering profit calculation from admin dashboard...');
        const result = await calculateAndUpdateProfits(true); // Force calculation regardless of profit day
        
        if (result) {
            console.log('Manual profit calculation completed successfully');
            res.json({
                success: true,
                message: 'Profit calculation completed successfully'
            });
        } else {
            console.log('Manual profit calculation failed');
            res.json({
                success: false,
                message: 'Profit calculation failed'
            });
        }
    } catch (error) {
        console.error('Error running manual profit calculation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to run profit calculation',
            error: error.message
        });
    }
});

// Add route to generate missing referral codes
adminRouter.post('/generate-missing-referral-codes', adminAuth, async (req, res) => {
    try {
        console.log('Generating missing referral codes...');
        
        // Find users without referral codes
        const usersWithoutCodes = await User.findAll({
            where: {
                referralCode: null
            }
        });
        
        console.log(`Found ${usersWithoutCodes.length} users without referral codes`);
        
        if (usersWithoutCodes.length === 0) {
            return res.json({
                success: true,
                message: 'All users have referral codes',
                regeneratedCount: 0
            });
        }
        
        let successCount = 0;
        
        // Generate and assign unique referral codes
        for (const user of usersWithoutCodes) {
            try {
                // Generate a unique referral code
                const uniqueReferralCode = crypto.randomBytes(4).toString('hex');
                
                // Update the user
                await user.update({
                    referralCode: uniqueReferralCode
                });
                
                console.log(`Generated referral code ${uniqueReferralCode} for user ${user.id} (${user.email})`);
                successCount++;
            } catch (error) {
                console.error(`Error generating referral code for user ${user.id}:`, error);
            }
        }
        
        res.json({
            success: true,
            message: `Successfully generated referral codes for ${successCount} users`,
            regeneratedCount: successCount,
            totalUsers: usersWithoutCodes.length
        });
    } catch (error) {
        console.error('Error generating referral codes:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate referral codes',
            error: error.message
        });
    }
});

// Add broadcast message route
adminRouter.post('/broadcast', adminAuth, broadcastMessage);

export default adminRouter; 