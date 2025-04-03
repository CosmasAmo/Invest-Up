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
    allowNull: false
  },
  verifyOtp: {
    type: DataTypes.STRING,
    allowNull: true
  },
  verifyOtpExpireAt: {
    type: DataTypes.BIGINT,
    allowNull: true,
    defaultValue: 0
  },
  isAccountVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  resetOtp: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resetOtpExpireAt: {
    type: DataTypes.BIGINT,
    allowNull: true,
    defaultValue: 0
  },
  googleId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  referralCode: {
    type: DataTypes.STRING,
    unique: true
  },
  referralCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  referredBy: {
    type: DataTypes.UUID,
    allowNull: true
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  referralEarnings: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  profilePicture: {
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