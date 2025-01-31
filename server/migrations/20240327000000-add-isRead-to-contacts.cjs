'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Contacts', 'isRead', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Contacts', 'isRead');
  }
}; 