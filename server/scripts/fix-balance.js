import sequelize from '../config/database.js';
import User from '../models/userModel.js';
import dotenv from 'dotenv';

dotenv.config();

const userId = '3a6c47ab-8853-4cf9-b147-b0d0b9ff2bcc'; // Replace with your user ID if different
const correctBalance = 4000000.00; // The correct balance amount

const fixUserBalance = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connection established successfully.');
    
    // Find user
    const user = await User.findByPk(userId);
    
    if (!user) {
      console.error('User not found!');
      process.exit(1);
    }
    
    console.log(`Current user balance: $${user.balance}`);
    
    // Update balance
    await user.update({ balance: correctBalance });
    
    // Verify the update
    await user.reload();
    console.log(`User balance updated successfully to: $${user.balance}`);
    
    // Close connection and exit
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error fixing user balance:', error);
    process.exit(1);
  }
};

// Run the function
fixUserBalance(); 