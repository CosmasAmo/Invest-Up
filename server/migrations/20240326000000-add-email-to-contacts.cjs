'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // First add the column as nullable
    await queryInterface.addColumn('Contacts', 'email', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // Update existing records with a default email from their user
    await queryInterface.sequelize.query(`
      UPDATE "Contacts" c
      SET email = (
        SELECT email 
        FROM "Users" u 
        WHERE u.id = c."userId"
      )
      WHERE c.email IS NULL;
    `);

    // Now make it non-nullable
    await queryInterface.changeColumn('Contacts', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Contacts', 'email');
  }
}; 