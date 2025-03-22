import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
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
    unique: true,
    validate: {
      isEmail: true
    }
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
  referralCode: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  referralCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  referredBy: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id'
    },
    allowNull: true
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  referralEarnings: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  profileImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  successfulReferrals: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  }
}, {
  timestamps: true
});

User.belongsTo(User, { 
  as: 'Referrer', 
  foreignKey: 'referredBy'
});

User.hasMany(User, { 
  as: 'Referrals', 
  foreignKey: 'referredBy'
});

export default User;