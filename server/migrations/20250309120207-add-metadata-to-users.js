'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'metadata', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: {}
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'metadata');
  }
};
