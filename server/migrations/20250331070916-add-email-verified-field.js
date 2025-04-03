'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'isEmailVerified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });

    // Set isEmailVerified to true for all Google users
    await queryInterface.sequelize.query(`
      UPDATE "Users"
      SET "isEmailVerified" = true
      WHERE "googleId" IS NOT NULL AND "googleId" != ''
    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'isEmailVerified');
  }
};
