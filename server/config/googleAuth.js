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
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'https://investuptrading.com/backend/api/auth/google/callback',
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
    // For our own users
    if (user.id && typeof user.id === 'string' && user.id.includes('-')) {
        console.log(`Serializing database user with ID: ${user.id}`);
        done(null, { id: user.id, type: 'db' });
    } 
    // For Google users
    else if (user.id || user.googleId) {
        console.log(`Serializing Google user with ID: ${user.id || user.googleId}`);
        done(null, { id: user.id || user.googleId, type: 'google' });
    } 
    else {
        console.error('Unable to serialize user, no ID found:', user);
        done(new Error('No user ID available for serialization'));
    }
});

passport.deserializeUser(async (serialized, done) => {
    try {
        // Extract ID and type from serialized data
        const { id, type } = typeof serialized === 'object' ? serialized : { id: serialized, type: 'db' };
        
        console.log(`Deserializing user with ID: ${id}, type: ${type}`);
        
        // If it's a database user
        if (type === 'db') {
            try {
                const user = await User.findByPk(id);
                if (user) {
                    return done(null, user);
                }
            } catch (dbError) {
                console.error('Database error during deserializeUser:', dbError);
                // Continue to return a minimal user object below
            }
        }
        
        // If we get here, either:
        // 1. It's a Google user without a DB entry yet
        // 2. The database query failed
        // 3. We couldn't find the user in the database
        
        // Return a minimal user object with just the ID
        done(null, { id, isTemporary: true });
    } catch (error) {
        console.error('Error in deserializeUser:', error);
        done(error, null);
    }
});

export default passport; 