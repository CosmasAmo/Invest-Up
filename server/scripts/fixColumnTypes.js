import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

async function fixColumnTypes() {
  const sequelize = new Sequelize(process.env.POSTGRES_URL, {
    dialect: 'postgres',
    logging: true,
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

    console.log('Executing SQL to fix verifyOtpExpireAt...');
    
    // Update any numeric values to NULL that can't be converted
    await sequelize.query(`
      UPDATE "Users" 
      SET "verifyOtpExpireAt" = NULL 
      WHERE "verifyOtpExpireAt" IS NOT NULL 
      AND "verifyOtpExpireAt" = '0'
    `);
    
    // Then alter the column with explicit conversion
    await sequelize.query(`
      ALTER TABLE "Users" 
      ALTER COLUMN "verifyOtpExpireAt" TYPE TIMESTAMP WITH TIME ZONE 
      USING 
        CASE 
          WHEN "verifyOtpExpireAt" IS NULL THEN NULL
          WHEN "verifyOtpExpireAt" ~ '^[0-9]+$' THEN 
            to_timestamp("verifyOtpExpireAt"::bigint / 1000)
          ELSE "verifyOtpExpireAt"::timestamp with time zone
        END
    `);
    
    console.log('Successfully updated verifyOtpExpireAt!');
    
    console.log('Executing SQL to fix resetOtpExpireAt...');
    
    // First set any numeric values to NULL
    await sequelize.query(`
      UPDATE "Users" 
      SET "resetOtpExpireAt" = NULL 
      WHERE "resetOtpExpireAt" IS NOT NULL 
      AND "resetOtpExpireAt" = 0
    `);
    
    // Then alter the column with explicit conversion
    await sequelize.query(`
      ALTER TABLE "Users" 
      ALTER COLUMN "resetOtpExpireAt" TYPE TIMESTAMP WITH TIME ZONE 
      USING 
        CASE 
          WHEN "resetOtpExpireAt" IS NULL THEN NULL
          WHEN "resetOtpExpireAt" ~ '^[0-9]+$' THEN 
            to_timestamp("resetOtpExpireAt"::bigint / 1000)
          ELSE "resetOtpExpireAt"::timestamp with time zone
        END
    `);
    
    console.log('Successfully updated resetOtpExpireAt!');
    
    await sequelize.close();
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  }
}

fixColumnTypes(); 