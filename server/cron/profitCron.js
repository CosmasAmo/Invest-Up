import cron from 'node-cron';
import { calculateAndUpdateProfits } from '../services/profitService.js';
import { isProfitDay } from '../utils/dateUtils.js';
import { getSetting } from '../controllers/settingsController.js';

// Run every day at midnight
export const startProfitCron = () => {
    cron.schedule('0 0 * * *', async () => {
        const today = new Date();
        const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Get profit days setting
        const profitDays = await getSetting('profitDays') || [1, 2, 3, 4, 5]; // Default to weekdays if not set
        
        if (!isProfitDay(today, profitDays)) {
            console.log(`[${dateString}] Skipping daily profit calculation - today is not a configured profit day (${today.toLocaleDateString('en-US', { weekday: 'long' })})`);
            return;
        }
        
        console.log(`[${dateString}] Running daily profit calculations (${today.toLocaleDateString('en-US', { weekday: 'long' })})`);
        const success = await calculateAndUpdateProfits();
        
        if (success) {
            console.log(`[${dateString}] Daily profit calculation completed successfully`);
        } else {
            console.log(`[${dateString}] Daily profit calculation failed or was skipped`);
        }
    });
}; 