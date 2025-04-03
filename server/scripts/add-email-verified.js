import sequelize from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const addEmailVerifiedColumn = async () => {
  try {
    console.log('Adding isEmailVerified column to Users table...');
    
    // Check if column already exists
    try {
      await sequelize.query(`SELECT "isEmailVerified" FROM "Users" LIMIT 1`);
      console.log('Column already exists!');
      return;
    } catch (error) {
      console.log('Column does not exist yet, proceeding with creation...');
    }
    
    // Add isEmailVerified column
    await sequelize.query(`
      ALTER TABLE "Users" 
      ADD COLUMN "isEmailVerified" BOOLEAN NOT NULL DEFAULT false
    `);
    
    // Update all Google users to have verified emails
    await sequelize.query(`
      UPDATE "Users"
      SET "isEmailVerified" = true
      WHERE "googleId" IS NOT NULL AND "googleId" != ''
    `);
    
    console.log('Column added successfully!');
  } catch (error) {
    console.error('Error adding column:', error);
  } finally {
    // Close the connection
    await sequelize.close();
  }
};

// Run the function
addEmailVerifiedColumn(); 