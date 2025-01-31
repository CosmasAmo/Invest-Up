'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'referralEarnings', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0.00,
      allowNull: false
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Users', 'referralEarnings');
  }
};