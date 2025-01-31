const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.POSTGRES_URI, {
  dialect: 'postgres',
  logging: false
});

const User = sequelize.define('User', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  name: { type: Sequelize.STRING, allowNull: false },
  email: { type: Sequelize.STRING, allowNull: false },
  password: { type: Sequelize.STRING, allowNull: true },
  isAdmin: { type: Sequelize.BOOLEAN, defaultValue: false },
  isAccountVerified: { type: Sequelize.BOOLEAN, defaultValue: false },
  verifyOtp: { type: Sequelize.STRING, defaultValue: '' },
  verifyOtpExpireAt: { type: Sequelize.BIGINT, defaultValue: 0 },
  resetOtp: { type: Sequelize.STRING, defaultValue: '' },
  resetOtpExpireAt: { type: Sequelize.BIGINT, defaultValue: 0 },
  referralCode: { type: Sequelize.STRING },
  referralCount: { type: Sequelize.INTEGER, defaultValue: 0 },
  referredBy: { type: Sequelize.UUID, allowNull: true },
  balance: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0.00 },
  referralEarnings: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0.00 }
});

async function setupAdminUser() {
  try {
    await sequelize.authenticate();
    
    // Check if admin user exists
    let adminUser = await User.findOne({
      where: { email: 'admin@example.com' }
    });

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const uniqueReferralCode = crypto.randomBytes(4).toString('hex');

    if (adminUser) {
      // Update existing admin user
      await adminUser.update({
        name: 'Admin User',
        password: hashedPassword,
        isAdmin: true,
        isAccountVerified: true,
        referralCode: uniqueReferralCode,
        referralCount: 0,
        referredBy: null,
        balance: 0.00,
        referralEarnings: 0.00,
        verifyOtp: '',
        verifyOtpExpireAt: 0,
        resetOtp: '',
        resetOtpExpireAt: 0
      });
      console.log('Admin user updated successfully');
    } else {
      // Create new admin user
      await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        isAdmin: true,
        isAccountVerified: true,
        referralCode: uniqueReferralCode,
        referralCount: 0,
        referredBy: null,
        balance: 0.00,
        referralEarnings: 0.00,
        verifyOtp: '',
        verifyOtpExpireAt: 0,
        resetOtp: '',
        resetOtpExpireAt: 0
      });
      console.log('Admin user created successfully');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error setting up admin user:', error);
    process.exit(1);
  }
}

setupAdminUser(); 