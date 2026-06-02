import express from 'express';
import userAuth from '../middleware/userAuth.js';
import { 
    createInvestment, 
    getUserInvestments, 
    editInvestment, 
    deleteInvestment,
    getTotalInvestments,
    getTotalProfits,
    toggleInvestmentHidden,
    stopInvestment
} from '../controllers/investmentController.js';
import { getSetting } from '../controllers/settingsController.js';

const router = express.Router();

// Add OPTIONS handler for toggle-hidden route
router.options('/:investmentId/toggle-hidden', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    
    // Respond to preflight request with 204 No Content
    res.status(204).end();
});

// Add OPTIONS handler for stop investment route
router.options('/:investmentId/stop', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    
    // Respond to preflight request with 204 No Content
    res.status(204).end();
});

// Main routes - this router is mounted at /api/investments
router.post('/create', userAuth, createInvestment);
router.get('/', userAuth, getUserInvestments);
router.put('/edit', userAuth, editInvestment);
router.delete('/:investmentId', userAuth, deleteInvestment);
router.get('/total', userAuth, getTotalInvestments);
router.get('/profits', userAuth, getTotalProfits);
router.patch('/:investmentId/toggle-hidden', userAuth, toggleInvestmentHidden);
router.post('/:investmentId/stop', userAuth, stopInvestment);

// Add a route to check profit status based on configured profit days
router.get('/profit-status', async (req, res) => {
    try {
        const now = new Date();
        
        // Get profit days setting
        const profitDays = await getSetting('profitDays') || [1, 2, 3, 4, 5]; // Default to weekdays if not set
        const isProfitEnabled = profitDays.includes(now.getDay());
        
        // Calculate next profit day
        let nextProfitDay = new Date(now);
        
        // If today is not a profit day or it's already late in the day, find the next profit day
        if (!isProfitEnabled || now.getHours() >= 20) {
            let daysToAdd = 1;
            let foundNextDay = false;
            
            while (!foundNextDay && daysToAdd < 8) {
                nextProfitDay = new Date(now);
                nextProfitDay.setDate(now.getDate() + daysToAdd);
                
                if (profitDays.includes(nextProfitDay.getDay())) {
                    foundNextDay = true;
                } else {
                    daysToAdd++;
                }
            }
        }
        
        res.json({
            success: true,
            isProfitEnabled,
            currentDay: now.toLocaleDateString('en-US', { weekday: 'long' }),
            profitDays: profitDays.map(day => {
                const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                return dayNames[day];
            }),
            nextProfitDay: nextProfitDay.toISOString(),
            nextProfitDayFormatted: nextProfitDay.toLocaleDateString('en-US', { 
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

// For backward compatibility - make sure all of these accept the same path patterns as client requests
router.post('/investments', userAuth, createInvestment);
router.get('/investments', userAuth, getUserInvestments);
router.get('/investments/total', userAuth, getTotalInvestments);
router.get('/investments/profits/total', userAuth, getTotalProfits);
router.put('/investments/edit', userAuth, editInvestment);
router.delete('/investments/:investmentId', userAuth, deleteInvestment);

export default router; 