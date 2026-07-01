import { calculateAndUpdateProfits } from '../services/profitService.js';
import sequelize from '../config/database.js';

const triggerProfitUpdate = async () => {
  try {
    console.log('Manually triggering profit calculation...');
    
    const result = await calculateAndUpdateProfits();
    
    if (result) {
      console.log('Profit calculation completed successfully');
    } else {
      console.log('Profit calculation failed or was skipped');
    }
  } catch (error) {
    console.error('Error running profit calculation:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
  }
};

// Run the function
triggerProfitUpdate(); 