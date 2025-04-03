import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

async function fixColumnsDirectly() {
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

    // First set numeric values to NULL
    await sequelize.query(`
      UPDATE "Users" 
      SET "verifyOtpExpireAt" = NULL 
      WHERE "verifyOtpExpireAt" = 0
    `);

    await sequelize.query(`
      UPDATE "Users" 
      SET "resetOtpExpireAt" = NULL 
      WHERE "resetOtpExpireAt" = 0
    `);

    // Now alter the columns directly with explicit cast
    await sequelize.query(`
      ALTER TABLE "Users" 
      ALTER COLUMN "verifyOtpExpireAt" TYPE TIMESTAMP WITH TIME ZONE
      USING
        CASE
          WHEN "verifyOtpExpireAt" IS NULL THEN NULL
          ELSE to_timestamp("verifyOtpExpireAt" / 1000)
        END
    `);

    await sequelize.query(`
      ALTER TABLE "Users" 
      ALTER COLUMN "resetOtpExpireAt" TYPE TIMESTAMP WITH TIME ZONE
      USING
        CASE
          WHEN "resetOtpExpireAt" IS NULL THEN NULL
          ELSE to_timestamp("resetOtpExpireAt" / 1000)
        END
    `);

    console.log('Column types updated successfully!');

    // Verify the changes
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'Users'
      AND column_name IN ('verifyOtpExpireAt', 'resetOtpExpireAt')
    `);

    console.log('Updated column types:');
    console.table(results);
    
    await sequelize.close();
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  }
}

fixColumnsDirectly(); 