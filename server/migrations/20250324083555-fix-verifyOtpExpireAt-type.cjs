'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Execute raw SQL query to convert the column with explicit USING clause
    await queryInterface.sequelize.query(`
      -- First set any numeric/integer values to NULL that can't be converted
      UPDATE "Users" 
      SET "verifyOtpExpireAt" = NULL 
      WHERE "verifyOtpExpireAt" IS NOT NULL 
      AND "verifyOtpExpireAt" = '0';
      
      -- Then alter the column with explicit conversion
      ALTER TABLE "Users" 
      ALTER COLUMN "verifyOtpExpireAt" TYPE TIMESTAMP WITH TIME ZONE 
      USING 
        CASE 
          WHEN "verifyOtpExpireAt" IS NULL THEN NULL
          WHEN "verifyOtpExpireAt" ~ '^[0-9]+$' THEN 
            to_timestamp("verifyOtpExpireAt"::bigint / 1000)
          ELSE "verifyOtpExpireAt"::timestamp with time zone
        END;
    `);
  },

  async down (queryInterface, Sequelize) {
    // On rollback, convert back to BIGINT (this will lose precision)
    await queryInterface.sequelize.query(`
      ALTER TABLE "Users" 
      ALTER COLUMN "verifyOtpExpireAt" TYPE BIGINT 
      USING 
        CASE 
          WHEN "verifyOtpExpireAt" IS NULL THEN 0
          ELSE extract(epoch from "verifyOtpExpireAt")::bigint * 1000
        END;
    `);
  }
};
