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
  },
  depositAddresses: {
    type: DataTypes.JSON,
    defaultValue: {
      BINANCE: '374592285',
      TRC20: 'TYKbfLuFUUz5T3X2UFvhBuTSNvLE6TQpjX',
      BEP20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
      ERC20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
      OPTIMISM: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3'
    }
  }
}, {
  timestamps: true
});

export default Settings; 