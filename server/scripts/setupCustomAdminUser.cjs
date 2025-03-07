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
  isAccountVerified: { type: Sequelize.BOOLEAN, defaultValue: true },
  verifyOtp: { type: Sequelize.STRING, defaultValue: '' },
  verifyOtpExpireAt: { type: Sequelize.BIGINT, defaultValue: 0 },
  resetOtp: { type: Sequelize.STRING, defaultValue: '' },
  resetOtpExpireAt: { type: Sequelize.BIGINT, defaultValue: 0 },
  referralCode: { type: Sequelize.STRING },
  referralCount: { type: Sequelize.INTEGER, defaultValue: 0 },
  referredBy: { type: Sequelize.UUID, allowNull: true },
  balance: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0.00 },
  referralEarnings: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0.00 },
  successfulReferrals: { type: Sequelize.INTEGER, defaultValue: 0 }
});

// Custom admin user details - change these to your preferred values
const ADMIN_NAME = 'New Admin';
const ADMIN_EMAIL = 'newadmin@example.com';
const ADMIN_PASSWORD = 'Admin@123';

async function setupCustomAdminUser() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database successfully');
    
    // Check if admin user exists
    let adminUser = await User.findOne({
      where: { email: ADMIN_EMAIL }
    });

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const uniqueReferralCode = crypto.randomBytes(4).toString('hex');

    if (adminUser) {
      // Update existing admin user
      await adminUser.update({
        name: ADMIN_NAME,
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
        resetOtpExpireAt: 0,
        successfulReferrals: 0
      });
      console.log(`Admin user ${ADMIN_EMAIL} updated successfully`);
    } else {
      // Create new admin user
      await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
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
        resetOtpExpireAt: 0,
        successfulReferrals: 0
      });
      console.log(`Admin user ${ADMIN_EMAIL} created successfully`);
    }

    console.log('Admin credentials:');
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log('Please save these credentials securely!');

    process.exit(0);
  } catch (error) {
    console.error('Error setting up custom admin user:', error);
    process.exit(1);
  }
}

setupCustomAdminUser(); 