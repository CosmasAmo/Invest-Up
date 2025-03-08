import express from 'express';
import userAuth from '../middleware/userAuth.js';
import { 
    createInvestment, 
    getUserInvestments, 
    editInvestment, 
    deleteInvestment 
} from '../controllers/investmentController.js';

const router = express.Router();

router.post('/create', userAuth, createInvestment);
router.get('/', userAuth, getUserInvestments);
router.put('/edit', userAuth, editInvestment);
router.delete('/:investmentId', userAuth, deleteInvestment);

export default router; 