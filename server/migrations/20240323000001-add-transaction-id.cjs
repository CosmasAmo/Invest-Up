'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Deposits', 'transactionId', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      defaultValue: () => {
        const timestamp = new Date().getTime();
        const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        return `DEP${timestamp}${random}`;
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Deposits', 'transactionId');
  }
}; 