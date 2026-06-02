import Investment from '../models/Investment.js';
import User from '../models/userModel.js';
import sequelize from '../config/database.js';
import { getSetting } from '../controllers/settingsController.js';

/**
 * Force an update on all approved investments regardless of last update time
 * This script can be run to fix issues with profit calculation
 */
const updateAllInvestments = async () => {
  try {
    console.log('Starting forced profit update for all approved investments...');
    
    // Get profit settings from admin dashboard
    const defaultProfitPercentage = await getSetting('profitPercentage');
    if (!defaultProfitPercentage) {
      console.error('Default profit percentage not found in settings');
      return;
    }
    
    // Find all approved investments
    const investments = await Investment.findAll({
      where: {
        status: 'approved'
      },
      include: [{ model: User }]
    });
    
    console.log(`Found ${investments.length} approved investments to update`);
    let updatedCount = 0;
    
    for (const investment of investments) {
      const profitRate = investment.dailyProfitRate || defaultProfitPercentage;
      const dailyProfit = parseFloat(investment.amount) * (parseFloat(profitRate) / 100);
      
      console.log(`Investment ID: ${investment.id}`);
      console.log(`  Amount: $${parseFloat(investment.amount).toFixed(2)}`);
      console.log(`  Profit Rate: ${profitRate}%`);
      console.log(`  Daily Profit: $${dailyProfit.toFixed(2)}`);
      console.log(`  Current Total Profit: $${parseFloat(investment.totalProfit || 0).toFixed(2)}`);
      
      try {
        await sequelize.transaction(async (t) => {
          // Update investment profits with proper case sensitivity and handle NULL values
          await investment.update({
            totalProfit: sequelize.literal(`COALESCE("totalProfit", 0) + ${dailyProfit}`),
            lastProfitUpdate: new Date()
          }, { transaction: t });

          // Update user balance
          await investment.User.increment('balance', { 
            by: dailyProfit,
            transaction: t 
          });
        });
        
        // Get updated investment data
        await investment.reload();
        console.log(`  New Total Profit: $${parseFloat(investment.totalProfit || 0).toFixed(2)}`);
        console.log(`  Updated successfully`);
        updatedCount++;
      } catch (error) {
        console.error(`Error updating investment ${investment.id}:`, error);
      }
    }
    
    console.log(`Done. Updated ${updatedCount} out of ${investments.length} investments.`);
  } catch (error) {
    console.error('Error updating all investments:', error);
  } finally {
    await sequelize.close();
  }
};

// Run the function
updateAllInvestments(); 