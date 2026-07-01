import { calculateAndUpdateProfits } from '../services/profitService.js';
import Investment from '../models/Investment.js';
import User from '../models/userModel.js';
import sequelize from '../config/database.js';

const testProfitCalculation = async () => {
  try {
    console.log('Testing profit calculation...');
    
    // Get investments before update
    const beforeInvestments = await Investment.findAll({
      where: { status: 'approved' },
      include: [{ model: User }]
    });
    
    console.log(`Found ${beforeInvestments.length} approved investments before calculation`);
    
    // Print current investment details
    beforeInvestments.forEach((investment, index) => {
      console.log(`\nInvestment #${index + 1} before update:`);
      console.log(`ID: ${investment.id}`);
      console.log(`Amount: $${parseFloat(investment.amount).toFixed(2)}`);
      console.log(`Total Profit: $${parseFloat(investment.totalProfit || 0).toFixed(2)}`);
      console.log(`Daily Profit Rate: ${investment.dailyProfitRate ? investment.dailyProfitRate + '%' : 'Not set'}`);
      console.log(`Last Profit Update: ${investment.lastProfitUpdate ? new Date(investment.lastProfitUpdate).toLocaleString() : 'Never'}`);
      console.log(`User balance: $${parseFloat(investment.User?.balance || 0).toFixed(2)}`);
    });
    
    // Temporarily set lastProfitUpdate to yesterday for all investments to make them eligible
    console.log('\nTemporarily setting lastProfitUpdate to yesterday for testing...');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    for (const investment of beforeInvestments) {
      await investment.update({ lastProfitUpdate: yesterday });
    }
    
    // Run the profit calculation
    console.log('\nRunning profit calculation...');
    const result = await calculateAndUpdateProfits();
    console.log(`Profit calculation result: ${result ? 'Success' : 'Failed'}`);
    
    // Get investments after update
    const afterInvestments = await Investment.findAll({
      where: { status: 'approved' },
      include: [{ model: User }],
      order: [['id', 'ASC']]
    });
    
    // Print updated investment details
    afterInvestments.forEach((investment, index) => {
      const before = beforeInvestments.find(inv => inv.id === investment.id);
      
      console.log(`\nInvestment #${index + 1} after update:`);
      console.log(`ID: ${investment.id}`);
      console.log(`Amount: $${parseFloat(investment.amount).toFixed(2)}`);
      console.log(`Total Profit: $${parseFloat(investment.totalProfit || 0).toFixed(2)}`);
      console.log(`Daily Profit Rate: ${investment.dailyProfitRate ? investment.dailyProfitRate + '%' : 'Not set'}`);
      console.log(`Last Profit Update: ${investment.lastProfitUpdate ? new Date(investment.lastProfitUpdate).toLocaleString() : 'Never'}`);
      console.log(`User balance: $${parseFloat(investment.User?.balance || 0).toFixed(2)}`);
      
      // Calculate and show profit change
      if (before) {
        const profitChange = parseFloat(investment.totalProfit || 0) - parseFloat(before.totalProfit || 0);
        const balanceChange = parseFloat(investment.User?.balance || 0) - parseFloat(before.User?.balance || 0);
        
        console.log(`Profit increased by: $${profitChange.toFixed(2)}`);
        console.log(`User balance increased by: $${balanceChange.toFixed(2)}`);
      }
    });
    
  } catch (error) {
    console.error('Error in profit calculation test:', error);
  } finally {
    await sequelize.close();
  }
};

testProfitCalculation(); 