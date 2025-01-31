import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/userModel.js';
import crypto from 'crypto';
import { DataTypes } from 'sequelize';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/api/auth/google/callback"
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
      const existingUser = await User.findOne({ 
        where: { email: profile.emails[0].value } 
      });

      if (existingUser) {
        if (!existingUser.googleId) {
          await existingUser.update({ googleId: profile.id });
        }
        return done(null, existingUser);
      }

      // Generate unique referral code for new user
      const uniqueReferralCode = crypto.randomBytes(4).toString('hex');

      // Create new user with all required fields
      const newUser = await User.create({
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        password: null,
        verifyOtp: '',
        verifyOtpExpireAt: 0,
        isAccountVerified: true,
        resetOtp: '',
        resetOtpExpireAt: 0,
        referralCode: uniqueReferralCode,
        referralCount: 0,
        referredBy: null,
        balance: 0.00,
        referralEarnings: 0.00
      });

      return done(null, newUser);
    } catch (error) {
      console.error('Google Auth Error:', error.message);
      return done(error, null);
    }
  }
));

// Add these required Passport serialization methods
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport; 