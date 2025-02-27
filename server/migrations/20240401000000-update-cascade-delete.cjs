'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Update Investments foreign key
    await queryInterface.removeConstraint('Investments', 'Investments_userId_fkey');
    await queryInterface.addConstraint('Investments', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'Investments_userId_fkey',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    // Update Deposits foreign key
    await queryInterface.removeConstraint('Deposits', 'Deposits_userId_fkey');
    await queryInterface.addConstraint('Deposits', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'Deposits_userId_fkey',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    // Update Withdrawals foreign key
    await queryInterface.removeConstraint('Withdrawals', 'Withdrawals_userId_fkey');
    await queryInterface.addConstraint('Withdrawals', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'Withdrawals_userId_fkey',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    // Update Contacts foreign key
    await queryInterface.removeConstraint('Contacts', 'Contacts_userId_fkey');
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

    // Update AuditLogs foreign key
    await queryInterface.removeConstraint('AuditLogs', 'AuditLogs_userId_fkey');
    await queryInterface.addConstraint('AuditLogs', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'AuditLogs_userId_fkey',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert Investments foreign key
    await queryInterface.removeConstraint('Investments', 'Investments_userId_fkey');
    await queryInterface.addConstraint('Investments', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'Investments_userId_fkey',
      references: {
        table: 'Users',
        field: 'id'
      }
    });

    // Revert Deposits foreign key
    await queryInterface.removeConstraint('Deposits', 'Deposits_userId_fkey');
    await queryInterface.addConstraint('Deposits', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'Deposits_userId_fkey',
      references: {
        table: 'Users',
        field: 'id'
      }
    });

    // Revert Withdrawals foreign key
    await queryInterface.removeConstraint('Withdrawals', 'Withdrawals_userId_fkey');
    await queryInterface.addConstraint('Withdrawals', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'Withdrawals_userId_fkey',
      references: {
        table: 'Users',
        field: 'id'
      }
    });

    // Revert Contacts foreign key
    await queryInterface.removeConstraint('Contacts', 'Contacts_userId_fkey');
    await queryInterface.addConstraint('Contacts', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'Contacts_userId_fkey',
      references: {
        table: 'Users',
        field: 'id'
      }
    });

    // Revert AuditLogs foreign key
    await queryInterface.removeConstraint('AuditLogs', 'AuditLogs_userId_fkey');
    await queryInterface.addConstraint('AuditLogs', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'AuditLogs_userId_fkey',
      references: {
        table: 'Users',
        field: 'id'
      }
    });
  }
}; 