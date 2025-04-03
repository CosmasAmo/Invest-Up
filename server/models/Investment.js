import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './userModel.js';

const Investment = sequelize.define('Investment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed'),
    defaultValue: 'pending'
  },
  dailyProfitRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: null,
    allowNull: true
  },
  totalProfit: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  lastProfitUpdate: {
    type: DataTypes.DATE,
    defaultValue: null
  }
}, {
  timestamps: true
});

// Define association
Investment.belongsTo(User, { 
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});

User.hasMany(Investment, { 
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});

export default Investment; 