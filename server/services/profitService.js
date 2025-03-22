import Investment from '../models/Investment.js';
import User from '../models/userModel.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import { isWeekend } from '../utils/dateUtils.js';

export const calculateAndUpdateProfits = async () => {
    try {
        // Check if today is a weekend
        if (isWeekend()) {
            console.log('Skipping profit calculation - weekend day');
            return false;
        }

        const approvedInvestments = await Investment.findAll({
            where: {
                status: 'approved',
                lastProfitUpdate: {
                    [Op.or]: [
                        { [Op.lt]: new Date(new Date() - 24 * 60 * 60 * 1000) }, // More than 24 hours ago
                        { [Op.is]: null } // Never updated
                    ]
                }
            },
            include: [{ model: User }]
        });

        console.log(`Found ${approvedInvestments.length} investments for daily profit update`);
        let updatedCount = 0;

        for (const investment of approvedInvestments) {
            const dailyProfit = parseFloat(investment.amount) * (parseFloat(investment.dailyProfitRate) / 100);
            
            await sequelize.transaction(async (t) => {
                // Update investment profits
                await investment.update({
                    totalProfit: sequelize.literal(`totalProfit + ${dailyProfit}`),
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
            console.log(`Updated daily profits for ${updatedCount} investments`);
        }

        return true;
    } catch (error) {
        console.error('Error calculating profits:', error);
        return false;
    }
}; 