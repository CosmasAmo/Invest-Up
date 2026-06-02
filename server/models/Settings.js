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
    type: DataTypes.JSON,
    defaultValue: {
      BINANCE: '374592285',
      TRC20: 'TYKbfLuFUUz5T3X2UFvhBuTSNvLE6TQpjX',
      BEP20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
      ERC20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
      OPTIMISM: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3'
    },
    get() {
      const rawValue = this.getDataValue('depositAddresses');
      if (typeof rawValue === 'string') {
        try {
          return JSON.parse(rawValue);
        } catch (error) {
          console.error('Error parsing depositAddresses:', error);
          return {
            BINANCE: '374592285',
            TRC20: 'TYKbfLuFUUz5T3X2UFvhBuTSNvLE6TQpjX',
            BEP20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
            ERC20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
            OPTIMISM: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3'
          };
        }
      }
      return rawValue;
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