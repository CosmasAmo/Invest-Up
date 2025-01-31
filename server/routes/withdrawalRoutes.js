import express from 'express';
import { requestWithdrawal, getWithdrawalHistory } from '../controllers/withdrawalController.js';
import userAuth from '../middleware/userAuth.js';

const router = express.Router();

router.post('/request', userAuth, requestWithdrawal);
router.get('/history', userAuth, getWithdrawalHistory);

export default router; 