import express from 'express';
import userAuth from '../middleware/userAuth.js';
import upload from '../middleware/fileUpload.js';
import {
    createDeposit,
    editDeposit,
    deleteDeposit,
    toggleDepositHidden,
    createWithdrawal,
    getWithdrawals,
    getTotalWithdrawals,
    deleteWithdrawal
} from '../controllers/transactionController.js';

const router = express.Router();

// Deposit routes
router.post('/deposit', userAuth, upload.single('proofImage'), createDeposit);
router.put('/deposit/edit', userAuth, upload.single('proofImage'), editDeposit);
router.delete('/deposit/:depositId', userAuth, deleteDeposit);

// Add OPTIONS handler for toggle-hidden route
router.options('/deposit/:depositId/toggle-hidden', (req, res) => {
    const origin = req.headers.origin;
    
    // Set CORS headers
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    
    // Respond to preflight request with 204 No Content
    res.status(204).end();
});

router.patch('/deposit/:depositId/toggle-hidden', userAuth, toggleDepositHidden);

// Withdrawal routes
router.post('/withdrawals', userAuth, createWithdrawal);
router.get('/withdrawals', userAuth, getWithdrawals);
router.get('/withdrawals/total', userAuth, getTotalWithdrawals);
router.delete('/withdrawals/:withdrawalId', userAuth, deleteWithdrawal);

export default router; 