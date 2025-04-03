'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Investments', 'dailyProfitRate', {
      type: Sequelize.DECIMAL(5, 2),
      defaultValue: null,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Investments', 'dailyProfitRate');
  }
}; 