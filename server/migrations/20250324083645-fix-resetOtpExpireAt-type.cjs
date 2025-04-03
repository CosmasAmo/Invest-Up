'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Execute raw SQL query to convert the column with explicit USING clause
    await queryInterface.sequelize.query(`
      -- First set any numeric/integer values to proper timestamps
      UPDATE "Users" 
      SET "resetOtpExpireAt" = NULL 
      WHERE "resetOtpExpireAt" IS NOT NULL 
      AND "resetOtpExpireAt" = 0;
      
      -- Then alter the column with explicit conversion
      ALTER TABLE "Users" 
      ALTER COLUMN "resetOtpExpireAt" TYPE TIMESTAMP WITH TIME ZONE 
      USING 
        CASE 
          WHEN "resetOtpExpireAt" IS NULL THEN NULL
          WHEN "resetOtpExpireAt" ~ '^[0-9]+$' THEN 
            to_timestamp("resetOtpExpireAt"::bigint / 1000)
          ELSE "resetOtpExpireAt"::timestamp with time zone
        END;
    `);
  },

  async down (queryInterface, Sequelize) {
    // On rollback, convert back to BIGINT (this will lose precision)
    await queryInterface.sequelize.query(`
      ALTER TABLE "Users" 
      ALTER COLUMN "resetOtpExpireAt" TYPE BIGINT 
      USING 
        CASE 
          WHEN "resetOtpExpireAt" IS NULL THEN 0
          ELSE extract(epoch from "resetOtpExpireAt")::bigint * 1000
        END;
    `);
  }
};
