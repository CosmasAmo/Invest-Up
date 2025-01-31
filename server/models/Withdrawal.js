import { sequelize } from '../config/database.js';
import { DataTypes } from 'sequelize';
import User from './userModel.js';

const Withdrawal = sequelize.define('Withdrawal', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  transactionId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    defaultValue: () => {
      const timestamp = new Date().getTime();
      const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      return `WTH${timestamp}${random}`;
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false
  },
  walletAddress: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  }
});

// Add associations
Withdrawal.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Withdrawal, { foreignKey: 'userId' });

export default Withdrawal; 