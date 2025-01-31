const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.addColumn('Users', 'referralCode', {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true
    });

    await queryInterface.addColumn('Users', 'referredBy', {
      type: DataTypes.UUID,
      references: {
        model: 'Users',
        key: 'id'
      },
      allowNull: true
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Users', 'referralCode');
    await queryInterface.removeColumn('Users', 'referredBy');
  }
}; 