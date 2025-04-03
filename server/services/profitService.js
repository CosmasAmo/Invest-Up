import Investment from '../models/Investment.js';
import User from '../models/userModel.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import { isWeekend } from '../utils/dateUtils.js';
import { getSetting } from '../controllers/settingsController.js';

export const calculateAndUpdateProfits = async () => {
    try {
        // Check if today is a weekend
        if (isWeekend()) {
            console.log('Skipping profit calculation - weekend day');
            return false;
        }

        // Get profit settings from admin dashboard
        const defaultProfitPercentage = await getSetting('profitPercentage');
        if (!defaultProfitPercentage) {
            console.error('Default profit percentage not found in settings');
            return false;
        }
        
        // Get profit interval in minutes from settings (default to 1440 minutes = 24 hours if not set)
        const profitIntervalMinutes = await getSetting('profitInterval') || 1440;
        console.log(`Using profit interval of ${profitIntervalMinutes} minutes from settings`);
        
        // Convert profitInterval from minutes to milliseconds
        const profitIntervalMs = parseInt(profitIntervalMinutes) * 60 * 1000;

        const approvedInvestments = await Investment.findAll({
            where: {
                status: 'approved',
                lastProfitUpdate: {
                    [Op.or]: [
                        { [Op.lt]: new Date(new Date() - profitIntervalMs) }, // More than profitInterval ago
                        { [Op.is]: null } // Never updated
                    ]
                }
            },
            include: [{ model: User }]
        });

        console.log(`Found ${approvedInvestments.length} investments for profit update using ${profitIntervalMinutes} minute interval`);
        let updatedCount = 0;

        for (const investment of approvedInvestments) {
            // Use investment's specific profit rate or fall back to default
            const profitRate = investment.dailyProfitRate || defaultProfitPercentage;
            const dailyProfit = parseFloat(investment.amount) * (parseFloat(profitRate) / 100);
            
            await sequelize.transaction(async (t) => {
                // Update investment profits with proper case sensitivity
                await investment.update({
                    totalProfit: sequelize.literal(`"totalProfit" + ${dailyProfit}`),
                    lastProfitUpdate: new Date()
                }, { transaction: t });

                // Update user balance
                await investment.User.increment('balance', { 
                    by: dailyProfit,
                    transaction: t 
                });
            });
            
            updatedCount++;
        }
        
        if (updatedCount > 0) {
            console.log(`Updated profits for ${updatedCount} investments`);
        }

        return true;
    } catch (error) {
        console.error('Error calculating profits:', error);
        return false;
    }
}; 