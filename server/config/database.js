import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false,
        pool: {
            max: 10, // Increased max connections
            min: 0,
            acquire: 60000, // Increased acquire timeout to 60 seconds
            idle: 30000, // Increased idle timeout to 30 seconds
            evict: 1000, // Run cleanup every 1 second
            handleDisconnects: true // Handle disconnects automatically
        },
        retry: {
            max: 3, // Maximum retry attempts
            match: [/Deadlock/i, /Connection lost/i, /ETIMEDOUT/i, /ECONNRESET/i, /ECONNREFUSED/i, /SequelizeConnectionError/i, /SequelizeConnectionRefusedError/i, /SequelizeHostNotFoundError/i, /SequelizeHostNotReachableError/i, /SequelizeInvalidConnectionError/i, /SequelizeConnectionTimedOutError/i, /TimeoutError/i, /SequelizeConnectionAcquireTimeoutError/i],
            backoffBase: 1000, // Initial backoff duration in ms
            backoffExponent: 1.5 // Exponential backoff
        }
    }
);

// Test the connection
sequelize.authenticate()
    .then(() => {
        console.log('Database connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

export default sequelize; 