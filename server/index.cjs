// This is a CommonJS wrapper for the ES Module server.js
// The .cjs extension ensures Node.js treats this as CommonJS regardless of package.json settings

// Load environment variables first
require('dotenv').config();

// Start the ES Module server
(async () => {
  try {
    console.log('Starting server...');
    
    // Log environment status
    if (!process.env.MYSQL_URL) {
      console.warn('Warning: MYSQL_URL environment variable is missing');
    }
    
    // Run server.js as ES Module
    const { spawn } = require('child_process');
    const serverProcess = spawn('node', [
      '--experimental-specifier-resolution=node', 
      '--experimental-modules', 
      './server.js'
    ], {
      stdio: 'inherit',
      env: process.env
    });
    
    // Handle server process events
    serverProcess.on('error', (err) => {
      console.error('Failed to start server process:', err);
      process.exit(1);
    });
    
    // Forward termination signals to child process
    ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => {
      process.on(signal, () => {
        serverProcess.kill(signal);
        process.exit();
      });
    });
    
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
})(); 