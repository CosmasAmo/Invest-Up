import sequelize from '../config/database.js';

const addDailyProfitRateColumn = async () => {
  try {
    console.log('Adding dailyProfitRate column to Investments table...');
    
    // Check if column already exists
    const [checkResults] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='Investments' AND column_name='dailyProfitRate'
    `);
    
    if (checkResults.length > 0) {
      console.log('Column dailyProfitRate already exists in Investments table');
      return;
    }
    
    // Add the column
    await sequelize.query(`
      ALTER TABLE "Investments" 
      ADD COLUMN "dailyProfitRate" DECIMAL(5,2) DEFAULT NULL
    `);
    
    console.log('Successfully added dailyProfitRate column to Investments table');
  } catch (error) {
    console.error('Error adding dailyProfitRate column:', error);
  } finally {
    await sequelize.close();
  }
};

// Run the function
addDailyProfitRateColumn(); 