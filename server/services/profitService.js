import Investment from '../models/Investment.js';
import User from '../models/userModel.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import { isProfitDay } from '../utils/dateUtils.js';
import { getSetting } from '../controllers/settingsController.js';

export const calculateAndUpdateProfits = async (forceCalculation = false) => {
    try {
        // Get profit days setting
        const profitDays = await getSetting('profitDays') || [1, 2, 3, 4, 5]; // Default to weekdays if not set
        
        // Check if today is a profit day, unless forceCalculation is true
        if (!forceCalculation && !isProfitDay(new Date(), profitDays)) {
            console.log('Skipping profit calculation - not a configured profit day');
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

        // When forcing calculation, we want to include all investments regardless of last update time
        const whereClause = forceCalculation ? 
            { status: 'approved' } : 
            {
                status: 'approved',
                lastProfitUpdate: {
                    [Op.or]: [
                        { [Op.lt]: new Date(new Date() - profitIntervalMs) }, // More than profitInterval ago
                        { [Op.is]: null } // Never updated
                    ]
                }
            };

        const approvedInvestments = await Investment.findAll({
            where: whereClause,
            include: [{ model: User }]
        });

        console.log(`Found ${approvedInvestments.length} investments for profit update using ${profitIntervalMinutes} minute interval`);
        let updatedCount = 0;
        
        // Process each investment
        for (const investment of approvedInvestments) {
            try {
                // Use the investment's custom profit rate if available, otherwise use the default
                const profitRate = investment.dailyProfitRate || defaultProfitPercentage;
                
                // Calculate profit amount based on investment amount and profit rate
                const profitAmount = (parseFloat(investment.amount) * parseFloat(profitRate)) / 100;
                
                // Update the investment's total profit and last update time using a transaction
                await sequelize.transaction(async (t) => {
                    // Update the investment
                    await investment.update({
                        totalProfit: sequelize.literal(`totalProfit + ${profitAmount}`),
                        lastProfitUpdate: new Date()
                    }, { transaction: t });
                    
                    // Update the user's balance
                    await investment.User.increment('balance', { 
                        by: profitAmount,
                        transaction: t 
                    });
                    
                    console.log(`Profit of $${profitAmount} added to investment ID ${investment.id} for user ${investment.User.id}`);
                    updatedCount++;
                });
                
            } catch (investmentError) {
                console.error(`Error processing profit for investment ID ${investment.id}:`, investmentError);
            }
        }
        
        console.log(`Successfully updated profits for ${updatedCount} of ${approvedInvestments.length} investments`);
        return updatedCount > 0;
        
    } catch (error) {
        console.error('Error in profit calculation service:', error);
        return false;
    }
}; 