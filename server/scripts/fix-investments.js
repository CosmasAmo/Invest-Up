import Investment from '../models/Investment.js';
import sequelize from '../config/database.js';

const fixInvestments = async () => {
  try {
    console.log('Starting fix for investments with null totalProfit...');
    
    // Find all investments with null totalProfit
    const investments = await Investment.findAll({
      where: {
        totalProfit: null
      }
    });
    
    console.log(`Found ${investments.length} investments with null totalProfit`);
    
    if (investments.length === 0) {
      console.log('No investments need to be fixed.');
      return;
    }
    
    // Fix each investment
    for (const investment of investments) {
      console.log(`Fixing investment ${investment.id}...`);
      
      await investment.update({
        totalProfit: 0.00
      });
      
      console.log(`Fixed investment ${investment.id}`);
    }
    
    console.log('Completed fixing investments with null totalProfit');
  } catch (error) {
    console.error('Error fixing investments:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
  }
};

// Run the function
fixInvestments(); 