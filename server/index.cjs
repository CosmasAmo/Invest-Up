// This is a CommonJS wrapper for the ES Module server.js
// The .cjs extension ensures Node.js treats this as CommonJS regardless of package.json settings

// Load environment variables first
require('dotenv').config();

// Use dynamic import to load the ES Module
(async () => {
  try {
    console.log('Starting server through CommonJS wrapper...');
    // Log environment variables (without sensitive data)
    console.log('Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      POSTGRES_URL: process.env.POSTGRES_URL ? '***URI exists***' : '***Missing***'
    });
    
    // Verify the environment variable
    if (!process.env.POSTGRES_URL) {
      console.error('ERROR: POSTGRES_URL environment variable is missing!');
      console.error('Make sure your .env file is properly uploaded and accessible');
      
      // Optional: Create a local .env file if it doesn't exist
      const fs = require('fs');
      const path = require('path');
      
      if (!fs.existsSync(path.join(__dirname, '.env'))) {
        console.log('Creating a temporary .env file for testing...');
        fs.writeFileSync(path.join(__dirname, '.env'), 'NODE_ENV=production\nPOSTGRES_URL=postgresql://neondb_owner:npg_GoJ1IVuwX3jm@ep-black-dew-a4t32f11-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require');
      }
    }
    
    // Dynamic import of the ES Module
    await import('./server.js');
  } catch (error) {
    console.error('Error starting server through CommonJS wrapper:', error);
    
    // Try to start in fallback mode without DB
    try {
      console.log('Attempting to start server in fallback mode...');
      process.env.FALLBACK_MODE = 'true';
      await import('./server.js');
    } catch (fallbackError) {
      console.error('Error starting server in fallback mode:', fallbackError);
      process.exit(1);
    }
  }
})(); 