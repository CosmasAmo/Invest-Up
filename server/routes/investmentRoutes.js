import express from 'express';
import userAuth from '../middleware/userAuth.js';
import { createInvestment, getUserInvestments } from '../controllers/investmentController.js';

const router = express.Router();

router.post('/create', userAuth, createInvestment);
router.get('/', userAuth, getUserInvestments);

export default router; 