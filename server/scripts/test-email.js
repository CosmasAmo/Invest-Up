import transporter from '../config/nodemailer.js';
import dotenv from 'dotenv';
import {EMAIL_VERIFY_TEMPLATE} from '../config/emailTemplates.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// For ES modules to get correct path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables manually
dotenv.config();

// Debug: Print all environment variables
console.log('Environment variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('SENDER_EMAIL:', process.env.SENDER_EMAIL);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '********' : 'Not set');

// Read env file directly to check if values are present
const envPath = path.resolve(__dirname, '../.env');
console.log('Reading .env file from:', envPath);
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('\nEnvironment file content (.env):');
  // Safely print the content without showing actual secrets
  const redactedContent = envContent
    .split('\n')
    .map(line => {
      if (line.includes('PASS=') || line.includes('SECRET=') || line.includes('KEY=')) {
        const parts = line.split('=');
        return parts[0] + '=********';
      }
      return line;
    })
    .join('\n');
  console.log(redactedContent);
} catch (err) {
  console.error('Error reading .env file:', err.message);
}

async function testEmailSending() {
  try {
    console.log('\nAttempting to send a test email...');
    
    // Create a test transporter with debug output
    const testOptions = {
      host: 'smtp-relay.brevo.com',
      port: 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      debug: true, // Enable debug output
      logger: true, // Log to console
      tls: {
        rejectUnauthorized: false
      }
    };
    
    console.log('Email transport options:', {
      ...testOptions,
      auth: {
        user: testOptions.auth.user,
        pass: '********'
      }
    });
    
    const testTransporter = transporter;
    const testEmail = process.env.SENDER_EMAIL; // Send to yourself for testing
    const testOtp = '123456';
    
    const mailOptions = {
      from: {
        name: 'Invest Up',
        address: process.env.SENDER_EMAIL
      },
      to: testEmail,
      subject: 'Test Email - Email Verification',
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", testOtp).replace("{{email}}", testEmail)
    };
    
    console.log(`Sending email to: ${testEmail}`);
    const info = await testTransporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ Error sending email:', error);
  } finally {
    process.exit(0);
  }
}

testEmailSending(); 