import express from 'express';
import userAuth from '../middleware/userAuth.js';
import { 
    createInvestment, 
    getUserInvestments, 
    editInvestment, 
    deleteInvestment 
} from '../controllers/investmentController.js';
import { isWeekend, getNextBusinessDay } from '../utils/dateUtils.js';

const router = express.Router();

router.post('/create', userAuth, createInvestment);
router.get('/', userAuth, getUserInvestments);
router.put('/edit', userAuth, editInvestment);
router.delete('/:investmentId', userAuth, deleteInvestment);

// Add a route to check profit status (enabled on weekdays, disabled on weekends)
router.get('/profit-status', async (req, res) => {
    try {
        const now = new Date();
        const isWeekendDay = isWeekend(now);
        const nextBusinessDay = getNextBusinessDay(now);
        
        res.json({
            success: true,
            isProfitEnabled: !isWeekendDay,
            currentDay: now.toLocaleDateString('en-US', { weekday: 'long' }),
            isWeekend: isWeekendDay,
            nextBusinessDay: nextBusinessDay.toISOString(),
            nextBusinessDayFormatted: nextBusinessDay.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })
        });
    } catch (error) {
        console.error('Error getting profit status:', error);
        res.json({ success: false, message: error.message });
    }
});

export default router; 