import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

// For ES modules to get correct path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Copy test environment to .env.local (which will be used and not committed to git)
const testEnvPath = path.join(projectRoot, '.env.test');
const localEnvPath = path.join(projectRoot, '.env.local');

console.log('Setting up test environment...');
try {
  // Read the test environment file
  const testEnvContent = fs.readFileSync(testEnvPath, 'utf8');
  
  // Write to local env file
  fs.writeFileSync(localEnvPath, testEnvContent);
  console.log('Created .env.local with test configuration');
} catch (err) {
  console.error('Error setting up test environment:', err);
  process.exit(1);
}

// Start the server with the test env
console.log('Starting server in test mode...');
const serverProcess = spawn('node', ['server.js'], {
  cwd: projectRoot,
  env: {
    ...process.env,
    NODE_ENV: 'test',
    DOTENV_CONFIG_PATH: localEnvPath
  },
  stdio: 'inherit'
});

// Handle server process events
serverProcess.on('error', (err) => {
  console.error('Failed to start server:', err);
});

serverProcess.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

// Handle termination signals
process.on('SIGINT', () => {
  console.log('Stopping test server...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Stopping test server...');
  serverProcess.kill('SIGTERM');
}); 