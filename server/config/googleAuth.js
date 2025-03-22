import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import User from '../models/userModel.js';
import crypto from 'crypto';
import { DataTypes } from 'sequelize';
import { Op } from 'sequelize';

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Log profile data for debugging
        console.log('Google profile:', JSON.stringify(profile));
        
        // Get email and other profile info with fallbacks
        const email = profile.emails?.[0]?.value || profile.email || '';
        
        if (!email) {
          console.error('No email found in Google profile');
          return done(new Error('No email provided from Google'), null);
        }
        
        // Check if user exists
        const existingUser = await User.findOne({ 
          where: {
            [Op.or]: [
              { googleId: profile.id },
              { email: email }
            ]
          }
        });

        if (existingUser) {
          // Update googleId if user exists with this email but no googleId
          if (!existingUser.googleId) {
            await existingUser.update({ googleId: profile.id });
          }
          
          return done(null, existingUser);
        }
        
        // If not, we'll create a temporary profile to store in the session
        // The actual user will be created when they complete the profile
        return done(null, profile);
      } catch (error) {
        console.error('Error in Google strategy:', error);
        return done(error, null);
      }
    }
  )
);

// Add these required Passport serialization methods
passport.serializeUser((user, done) => {
    // For Google profiles that aren't yet in our database
    if (user.id && !user.googleId) {
        done(null, user.id);
    } else if (user.googleId) {
        // For users from our database
        done(null, user.id);
    } else {
        // For Google profiles
        done(null, user.id || user.googleId);
    }
});

passport.deserializeUser(async (id, done) => {
    try {
        // Try to find user in our database
        const user = await User.findByPk(id);
        
        if (user) {
            done(null, user);
        } else {
            // If not found (temporary Google profile), create an empty user object
            done(null, { id });
        }
    } catch (error) {
        done(error, null);
    }
});

export default passport; 