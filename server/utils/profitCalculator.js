import Investment from '../models/Investment.js';
import User from '../models/userModel.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import { getSetting } from '../controllers/settingsController.js';

export const calculateProfits = async () => {
    try {
        // Get profit settings
        const profitPercentage = await getSetting('profitPercentage');
        const profitInterval = await getSetting('profitInterval');
        
        const investments = await Investment.findAll({
            where: {
                status: 'approved',
                lastProfitUpdate: {
                    [Op.lt]: new Date(Date.now() - profitInterval * 60 * 1000) // Get investments that haven't been updated in the configured interval
                }
            },
            include: [{ model: User }]
        });

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
        }
    } catch (error) {
        console.error('Error calculating profits:', error);
    }
}; 