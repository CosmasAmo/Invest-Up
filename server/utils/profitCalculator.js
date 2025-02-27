import Investment from '../models/Investment.js';
import User from '../models/userModel.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

export const calculateProfits = async () => {
    try {
        const investments = await Investment.findAll({
            where: {
                status: 'approved',
                lastProfitUpdate: {
                    [Op.lt]: new Date(Date.now() - 5 * 60 * 1000) // Get investments that haven't been updated in 5 minutes
                }
            },
            include: [{ model: User }]
        });

        for (const investment of investments) {
            // Calculate 5% profit
            const profitAmount = parseFloat(investment.amount) * 0.05;
            
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