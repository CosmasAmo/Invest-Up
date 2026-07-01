import validateEmail from '../utils/emailValidator.js';

// This is a simple test script to verify the email validator
// Run with: node tests/emailValidator.test.js

const testEmails = [
  { email: 'test@example.com', description: 'Standard email format' },
  { email: 'invalid-email', description: 'Invalid email format' },
  { email: 'test@nonexistentdomain12345.com', description: 'Non-existent domain' },
  { email: 'noreply@gmail.com', description: 'Valid email that exists' },
];

const runTests = async () => {
  console.log('Testing Email Validator Utility\n');
  
  for (const test of testEmails) {
    console.log(`Testing: ${test.email} (${test.description})`);
    try {
      const result = await validateEmail(test.email);
      console.log(`Result: ${result.isValid ? 'VALID' : 'INVALID'}`);
      console.log(`Message: ${result.message}`);
    } catch (error) {
      console.error(`Error testing ${test.email}:`, error);
    }
    console.log('-----------------------------------');
  }
};

runTests().catch(console.error); 