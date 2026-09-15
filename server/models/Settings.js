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
  profitDays: {
    type: DataTypes.JSON,
    defaultValue: [1, 2, 3, 4, 5], // Default to weekdays (Monday = 1, Sunday = 0)
    get() {
      const rawValue = this.getDataValue('profitDays');
      if (typeof rawValue === 'string') {
        try {
          return JSON.parse(rawValue);
        } catch (error) {
          console.error('Error parsing profitDays:', error);
          return [1, 2, 3, 4, 5]; // Default to weekdays
        }
      }
      return rawValue;
    },
    set(value) {
      if (typeof value === 'object') {
        this.setDataValue('profitDays', value);
      } else if (typeof value === 'string') {
        try {
          const parsedValue = JSON.parse(value);
          this.setDataValue('profitDays', parsedValue);
        } catch (error) {
          console.error('Error setting profitDays:', error);
          this.setDataValue('profitDays', value);
        }
      } else {
        this.setDataValue('profitDays', value);
      }
    }
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
    // Addresses are served from server .env at runtime via getEnvDepositAddresses().
    // This DB column intentionally stores an empty object as a placeholder.
    type: DataTypes.JSON,
    defaultValue: {},
    get() {
      const rawValue = this.getDataValue('depositAddresses');
      if (typeof rawValue === 'string') {
        try {
          return JSON.parse(rawValue);
        } catch (error) {
          console.error('Error parsing depositAddresses:', error);
          return {}; // Never fall back to hardcoded addresses
        }
      }
      return rawValue || {};
    },
    set(value) {
      if (typeof value === 'object') {
        this.setDataValue('depositAddresses', value);
      } else if (typeof value === 'string') {
        try {
          const parsedValue = JSON.parse(value);
          this.setDataValue('depositAddresses', parsedValue);
        } catch (error) {
          console.error('Error setting depositAddresses:', error);
          this.setDataValue('depositAddresses', value);
        }
      } else {
        this.setDataValue('depositAddresses', value);
      }
    }
  }
}, {
  timestamps: true
});

export default Settings; 