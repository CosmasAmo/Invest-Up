import Investment from '../models/Investment.js';
import User from '../models/userModel.js';
import sequelize from '../config/database.js';

const checkInvestments = async () => {
  try {
    console.log('Checking investments...');
    
    // Find all approved investments
    const investments = await Investment.findAll({
      where: { status: 'approved' },
      include: [{ model: User }]
    });
    
    console.log(`Found ${investments.length} approved investments`);
    
    if (investments.length === 0) {
      console.log('No approved investments found');
      return;
    }
    
    // Log investment details
    investments.forEach((investment, index) => {
      console.log(`\nInvestment #${index + 1}:`);
      console.log(`ID: ${investment.id}`);
      console.log(`Amount: $${parseFloat(investment.amount).toFixed(2)}`);
      console.log(`Total Profit: $${parseFloat(investment.totalProfit || 0).toFixed(2)}`);
      console.log(`Daily Profit Rate: ${investment.dailyProfitRate ? investment.dailyProfitRate + '%' : 'Not set'}`);
      console.log(`Last Profit Update: ${investment.lastProfitUpdate ? new Date(investment.lastProfitUpdate).toLocaleString() : 'Never'}`);
      console.log(`User: ${investment.User ? investment.User.name : 'User not found'}`);
      
      // Calculate expected daily profit
      if (investment.dailyProfitRate) {
        const dailyProfit = parseFloat(investment.amount) * (parseFloat(investment.dailyProfitRate) / 100);
        console.log(`Expected daily profit: $${dailyProfit.toFixed(2)}`);
      }
    });
    
    // Get the settings
    const [settingsResult] = await sequelize.query(`SELECT * FROM "Settings" WHERE "key" = 'profitPercentage'`);
    if (settingsResult.length > 0) {
      console.log(`\nProfit percentage in settings: ${settingsResult[0].value}%`);
    } else {
      console.log('\nProfit percentage setting not found');
    }
    
  } catch (error) {
    console.error('Error checking investments:', error);
  } finally {
    await sequelize.close();
  }
};

checkInvestments(); 