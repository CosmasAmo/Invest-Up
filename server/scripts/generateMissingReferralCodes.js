import User from '../models/userModel.js';
import crypto from 'crypto';
import sequelize from '../config/database.js';

/**
 * This script generates referral codes for any users that are missing them
 */
const generateMissingReferralCodes = async () => {
  try {
    console.log('Checking for users with missing referral codes...');
    
    // Find users without referral codes
    const usersWithoutCodes = await User.findAll({
      where: {
        referralCode: null
      }
    });
    
    console.log(`Found ${usersWithoutCodes.length} users without referral codes`);
    
    if (usersWithoutCodes.length === 0) {
      console.log('All users have referral codes.');
      return;
    }
    
    let successCount = 0;
    
    // Generate and assign unique referral codes
    for (const user of usersWithoutCodes) {
      try {
        // Generate a unique referral code
        const uniqueReferralCode = crypto.randomBytes(4).toString('hex');
        
        // Update the user
        await user.update({
          referralCode: uniqueReferralCode
        });
        
        console.log(`Generated referral code ${uniqueReferralCode} for user ${user.id} (${user.email})`);
        successCount++;
      } catch (error) {
        console.error(`Error generating referral code for user ${user.id}:`, error);
      }
    }
    
    console.log(`Successfully generated referral codes for ${successCount} of ${usersWithoutCodes.length} users`);
  } catch (error) {
    console.error('Error in generateMissingReferralCodes script:', error);
  } finally {
    // Close database connection
    await sequelize.close();
  }
};

// Run the function
generateMissingReferralCodes(); 