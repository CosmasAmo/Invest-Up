import express from 'express';
import { 
    requestWithdrawal, 
    getWithdrawalHistory, 
    editWithdrawal, 
    deleteWithdrawal,
    toggleWithdrawalHidden
} from '../controllers/withdrawalController.js';
import userAuth from '../middleware/userAuth.js';

const router = express.Router();

router.post('/request', userAuth, requestWithdrawal);
router.get('/history', userAuth, getWithdrawalHistory);
router.put('/edit', userAuth, editWithdrawal);
router.delete('/:withdrawalId', userAuth, deleteWithdrawal);

// Add OPTIONS handler for toggle-hidden route
router.options('/:withdrawalId/toggle-hidden', (req, res) => {
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

router.patch('/:withdrawalId/toggle-hidden', userAuth, toggleWithdrawalHidden);

export default router; 