import express from 'express';
import { 
    requestWithdrawal, 
    getWithdrawalHistory, 
    editWithdrawal, 
    deleteWithdrawal 
} from '../controllers/withdrawalController.js';
import userAuth from '../middleware/userAuth.js';

const router = express.Router();

router.post('/request', userAuth, requestWithdrawal);
router.get('/history', userAuth, getWithdrawalHistory);
router.put('/edit', userAuth, editWithdrawal);
router.delete('/:withdrawalId', userAuth, deleteWithdrawal);

export default router; 