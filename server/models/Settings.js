import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Settings = sequelize.define('Settings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  referralBonus: {
    type: DataTypes.FLOAT,
    defaultValue: 5
  },
  minWithdrawal: {
    type: DataTypes.FLOAT,
    defaultValue: 3
  },
  minDeposit: {
    type: DataTypes.FLOAT,
    defaultValue: 3
  },
  minInvestment: {
    type: DataTypes.FLOAT,
    defaultValue: 3
  },
  profitPercentage: {
    type: DataTypes.FLOAT,
    defaultValue: 5
  },
  profitInterval: {
    type: DataTypes.INTEGER,
    defaultValue: 5 // in minutes
  },
  withdrawalFee: {
    type: DataTypes.FLOAT,
    defaultValue: 2
  },
  referralsRequired: {
    type: DataTypes.INTEGER,
    defaultValue: 2
  }
}, {
  timestamps: true
});

export default Settings; 