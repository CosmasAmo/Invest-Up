import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import User from '../models/userModel.js';
import { Op } from 'sequelize';

dotenv.config();

// Log important environment variables for debugging
console.log('Google OAuth Configuration:');
console.log('- Client ID present:', !!process.env.GOOGLE_CLIENT_ID);
console.log('- Client Secret present:', !!process.env.GOOGLE_CLIENT_SECRET);
console.log('- Callback URL:', process.env.GOOGLE_CALLBACK_URL || 'Not set');
console.log('- Client URL:', process.env.CLIENT_URL || 'Not set');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'https://backend.investuptrading.com/api/auth/google/callback',
      passReqToCallback: true, // Pass request to callback
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Log profile data for debugging
        console.log('Google profile received:', {
          id: profile.id,
          displayName: profile.displayName,
          email: profile.emails?.[0]?.value,
          hasPhoto: !!profile.photos?.[0]?.value,
          requestOrigin: req.headers.origin || 'Unknown'
        });
        
        // Get email and other profile info with fallbacks
        const email = profile.emails?.[0]?.value || profile.email || '';
        
        if (!email) {
          console.error('No email found in Google profile:', {
            profileId: profile.id,
            displayName: profile.displayName
          });
          return done(new Error('No email provided from Google. Please ensure you have granted email access.'), null);
        }

        // Always log the authentication attempt for debugging
        console.log(`Google auth attempt: ${email} with GoogleId ${profile.id}`);
        
        // Check if user exists specifically with this Google ID to ensure we match the right account
        let existingUser = await User.findOne({ 
          where: { googleId: profile.id }
        });

        // If no user found with this Google ID, look by email as fallback
        if (!existingUser) {
          console.log(`No user found with Google ID ${profile.id}, checking by email ${email}`);
          existingUser = await User.findOne({ 
            where: { email: email }
          });
        }

        if (existingUser) {
          console.log('Found existing user:', {
            userId: existingUser.id,
            email: existingUser.email,
            googleId: existingUser.googleId
          });
          
          // Always update the Google ID to ensure it's the most current one
          if (existingUser.googleId !== profile.id) {
            console.log(`Updating Google ID for user ${existingUser.id} from ${existingUser.googleId} to ${profile.id}`);
            await existingUser.update({ googleId: profile.id });
          }
          
          return done(null, existingUser);
        }
        
        console.log('Creating temporary profile for new user:', {
          email: email,
          googleId: profile.id
        });
        
        // If not, we'll create a temporary profile to store in the session
        // The actual user will be created when they complete the profile
        return done(null, {
          ...profile,
          isTemporary: true
        });
      } catch (error) {
        console.error('Error in Google strategy:', {
          error: error.message,
          stack: error.stack
        });
        return done(error, null);
      }
    }
  )
);

// Add these required Passport serialization methods
passport.serializeUser((user, done) => {
    // Clear any existing serialized user data to prevent conflicts
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