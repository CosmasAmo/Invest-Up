'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Remove both potential foreign key constraints
      await queryInterface.removeConstraint('Contacts', 'Contacts_userId_fkey');
    } catch (error) {
      console.log('First constraint may not exist:', error.message);
    }

    try {
      await queryInterface.removeConstraint('Contacts', 'Contacts_userId_fkey1');
    } catch (error) {
      console.log('Second constraint may not exist:', error.message);
    }

    // Add single foreign key constraint with CASCADE
    await queryInterface.addConstraint('Contacts', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'Contacts_userId_fkey',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove CASCADE constraint
    await queryInterface.removeConstraint('Contacts', 'Contacts_userId_fkey');

    // Add back normal foreign key
    await queryInterface.addConstraint('Contacts', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'Contacts_userId_fkey',
      references: {
        table: 'Users',
        field: 'id'
      }
    });
  }
}; 