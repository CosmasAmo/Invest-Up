import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const port = 3030;

// Configure session middleware with in-memory store
app.use(session({
  secret: 'test_session_secret',
  resave: false,
  saveUninitialized: true,
  store: new session.MemoryStore()
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure Google strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `http://investuptrading.com/backend/auth/google/callback`
}, (accessToken, refreshToken, profile, done) => {
  // Simplified user handling for testing
  return done(null, profile);
}));

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Routes
app.get('/', (req, res) => {
  res.send(`
    <h1>Google OAuth Test</h1>
    <a href="/auth/google">Login with Google</a>
    ${req.user ? `<p>Logged in as: ${req.user.displayName}</p>` : ''}
  `);
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication
    console.log('Authentication successful:', req.user.displayName);
    res.redirect('/');
  });

// Start server
app.listen(port, () => {
  console.log(`OAuth test server running at http://investuptrading.com:${port}`);
  console.log(`Google OAuth client ID: ${process.env.GOOGLE_CLIENT_ID.substring(0, 10)}...`);
  console.log('Visit http://investuptrading.com:3030 to test Google OAuth login');
}); 