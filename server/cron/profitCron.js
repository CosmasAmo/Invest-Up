import cron from 'node-cron';
import { calculateAndUpdateProfits } from '../services/profitService.js';

// Run every day at midnight
export const startProfitCron = () => {
    cron.schedule('0 0 * * *', async () => {
        console.log('Running daily profit calculations...');
        await calculateAndUpdateProfits();
    });
}; 