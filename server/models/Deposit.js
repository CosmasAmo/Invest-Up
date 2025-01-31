import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';
import User from './userModel.js';

const Deposit = sequelize.define('Deposit', {
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
      // Generate a unique transaction ID: DEP + timestamp + 6 random digits
      const timestamp = new Date().getTime();
      const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      return `DEP${timestamp}${random}`;
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
  proofImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  }
});

// Add associations
Deposit.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Deposit, { foreignKey: 'userId' });

export default Deposit;