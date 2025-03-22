import cron from 'node-cron';
import { calculateAndUpdateProfits } from '../services/profitService.js';
import { isWeekend } from '../utils/dateUtils.js';

// Run every day at midnight
export const startProfitCron = () => {
    cron.schedule('0 0 * * *', async () => {
        const today = new Date();
        const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        if (isWeekend(today)) {
            console.log(`[${dateString}] Skipping daily profit calculation - today is a weekend (${today.toLocaleDateString('en-US', { weekday: 'long' })})`);
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