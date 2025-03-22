import Investment from '../models/Investment.js';
import User from '../models/userModel.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import { getSetting } from '../controllers/settingsController.js';
import { isWeekend, getNextBusinessDay } from './dateUtils.js';

export const calculateProfits = async () => {
    try {
        // Check if today is a weekend
        if (isWeekend()) {
            console.log('Skipping profit calculation - weekend day');
            return;
        }
        
        // Get profit settings
        const profitPercentage = await getSetting('profitPercentage');
        const profitInterval = await getSetting('profitInterval');
        
        // Find eligible investments that haven't been updated recently
        const investments = await Investment.findAll({
            where: {
                status: 'approved',
                lastProfitUpdate: {
                    [Op.lt]: new Date(Date.now() - profitInterval * 60 * 1000)
                }
            },
            include: [{ model: User }]
        });

        console.log(`Found ${investments.length} investments to update profits`);
        
        let updatedCount = 0;
        for (const investment of investments) {
            // Calculate profit based on the configured percentage
            const profitAmount = parseFloat(investment.amount) * (profitPercentage / 100);
            
            // Add profit to user's balance
            await investment.User.increment('balance', { by: profitAmount });
            
            // Update lastProfitUpdate and totalProfit with correct column reference
            await investment.update({
                lastProfitUpdate: new Date(),
                totalProfit: sequelize.literal(`COALESCE("totalProfit", 0) + ${profitAmount}`)
            });
            
            updatedCount++;
        }
        
        if (updatedCount > 0) {
            console.log(`Updated profits for ${updatedCount} investments`);
        }
    } catch (error) {
        console.error('Error calculating profits:', error);
    }
}; 