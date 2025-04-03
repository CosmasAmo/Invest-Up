import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

console.log('Database connection string available:', !!process.env.POSTGRES_URL);
console.log('Trying to connect to database...');

let sequelize;

// Use the database connection string from environment variables
sequelize = new Sequelize(process.env.POSTGRES_URL, {
  dialect: 'postgres',
  logging: console.log, // Enable logging for debugging
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    },
    connectTimeout: 60000 // Increase connection timeout to 60 seconds
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 60000, // Increase acquire timeout
    idle: 10000
  },
  retry: {
    max: 3 // Retry connection up to 3 times
  }
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully!');
    
    // Sync all models
    // In production, you might want to use migrations instead
    // Temporarily commented out to avoid type conversion issues
    // await sequelize.sync();
    
  } catch (error) {
    console.error('Database connection failed:', error);
    // Don't exit process here, let the application handle the error
  }
};

export default sequelize;
export { connectDB }; 