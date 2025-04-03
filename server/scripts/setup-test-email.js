import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

async function createTestAccount() {
  console.log('Creating test email account with Ethereal...');
  
  try {
    // Create a test account at ethereal.email
    const testAccount = await nodemailer.createTestAccount();
    
    console.log('Test account created successfully!');
    console.log('--------------------------------');
    console.log('Email: ', testAccount.user);
    console.log('Password: ', testAccount.pass);
    console.log('SMTP Host: ', testAccount.smtp.host);
    console.log('SMTP Port: ', testAccount.smtp.port);
    console.log('--------------------------------');
    console.log('\nTo use these credentials, add them to your .env file:');
    console.log('\nETHEREAL_USER=', testAccount.user);
    console.log('ETHEREAL_PASS=', testAccount.pass);
    console.log('ETHEREAL_HOST=', testAccount.smtp.host);
    console.log('ETHEREAL_PORT=', testAccount.smtp.port);
    console.log('\nThen update your nodemailer.js file to use these credentials for testing.');
    console.log('\nIMPORTANT: These are temporary credentials for testing only.');
    console.log('View sent emails at: https://ethereal.email/login');
    console.log('Login with the email and password shown above.');
    
  } catch (error) {
    console.error('Error creating test account:', error);
  } finally {
    process.exit(0);
  }
}

createTestAccount(); 