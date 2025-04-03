import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

async function checkColumnTypes() {
  const sequelize = new Sequelize(process.env.POSTGRES_URL, {
    dialect: 'postgres',
    logging: console.log,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });

  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected successfully!');

    // Query the information_schema to get column types
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'Users'
      AND column_name IN ('verifyOtpExpireAt', 'resetOtpExpireAt')
    `);

    console.log('Column types:');
    console.table(results);
    
    await sequelize.close();
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  }
}

checkColumnTypes(); 