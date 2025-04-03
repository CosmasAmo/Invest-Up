import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import sequelize from '../config/database.js';

// Import all your models here to ensure they're registered with Sequelize
import '../models/userModel.js';
import '../models/Deposit.js';
import '../models/Withdrawal.js';
import '../models/Investment.js';
import '../models/AuditLog.js';
import '../models/Contact.js';
import '../models/Settings.js';
import '../models/deletedDepositModel.js';

dotenv.config();

const migrateToVercel = async () => {
  try {
    console.log('Starting migration to Vercel Postgres...');
    
    // Check for Vercel Postgres URL
    if (!process.env.POSTGRES_URL) {
      console.error('Error: POSTGRES_URL environment variable is not set.');
      console.log('Please set the POSTGRES_URL in your .env file with your Vercel Postgres connection string.');
      process.exit(1);
    }
    
    // Authenticate with Vercel Postgres
    await sequelize.authenticate();
    console.log('Successfully connected to Vercel Postgres database.');
    
    // Sync all models (this will create tables if they don't exist)
    await sequelize.sync({ force: false, alter: true });
    console.log('All models synchronized successfully with Vercel Postgres.');
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateToVercel(); 