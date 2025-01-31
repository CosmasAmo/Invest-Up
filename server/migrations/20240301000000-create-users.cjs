const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('Users', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true
      },
      verifyOtp: {
        type: DataTypes.STRING,
        defaultValue: ''
      },
      verifyOtpExpireAt: {
        type: DataTypes.BIGINT,
        defaultValue: 0
      },
      isAccountVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      resetOtp: {
        type: DataTypes.STRING,
        defaultValue: ''
      },
      resetOtpExpireAt: {
        type: DataTypes.BIGINT,
        defaultValue: 0
      },
      googleId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Users');
  }
};