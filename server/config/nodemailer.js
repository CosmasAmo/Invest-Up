import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter;

// More extensive logging
console.log('Email configuration:');
console.log('- SMTP_HOST:', process.env.SMTP_HOST || 'not set');
console.log('- SMTP_PORT:', process.env.SMTP_PORT || 'not set');
console.log('- SENDER_EMAIL:', process.env.SENDER_EMAIL || 'not set');
console.log('- SMTP_USER:', process.env.SMTP_USER ? 'set' : 'not set');
console.log('- SMTP_PASS:', process.env.SMTP_PASS ? 'set' : 'not set');

// Check if we're in test mode (using Ethereal) or production mode
if (process.env.NODE_ENV === 'test' && process.env.ETHEREAL_USER && process.env.ETHEREAL_PASS) {
  console.log('Using Ethereal Email for testing');
  
  // Create a test account transporter
  transporter = nodemailer.createTransport({
    host: process.env.ETHEREAL_HOST,
    port: parseInt(process.env.ETHEREAL_PORT),
    secure: false,
    auth: {
      user: process.env.ETHEREAL_USER,
      pass: process.env.ETHEREAL_PASS,
    },
    debug: process.env.NODE_ENV !== 'production', // Enable debug output in non-production
    logger: process.env.NODE_ENV !== 'production', // Log to console in non-production
  });
  
  // Verify connection
  transporter.verify()
    .then(() => console.log('Ethereal Email test account connected'))
    .catch(err => console.error('Ethereal Email connection error:', err));
  
} else if (!process.env.SMTP_USER || !process.env.SMTP_PASS || process.env.SMTP_USER === '' || process.env.SMTP_PASS === '') {
  console.log('Email credentials not provided - using preview mode (emails will NOT be sent)');
  
  // Create a preview/development transport that doesn't actually send emails
  transporter = {
    sendMail: (mailOptions) => {
      console.log('=======================================');
      console.log('EMAIL PREVIEW (not actually sent):');
      console.log('From:', mailOptions.from);
      console.log('To:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
      console.log('=======================================');
      console.log('HTML content preview available in logs only');
      
      // Return a fake successful response
      return Promise.resolve({
        messageId: `preview-${Date.now()}@localhost`,
        preview: true
      });
    }
  };
  
} else {
  console.log('Using Brevo SMTP for email delivery');
  
  // Enhanced SMTP configuration with better error handling
  const smtpConfig = {
    host: process.env.SMTP_HOST || 'smtp-brevo.com', // Using direct SMTP instead of relay
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // Convert string 'true' to boolean true
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Extended timeouts to prevent connection issues
    connectionTimeout: 20000, // 20 seconds
    greetingTimeout: 20000,
    socketTimeout: 20000,
    // Attempt to fix SSL/TLS issues
    tls: {
      rejectUnauthorized: false, // Fix for self-signed certificate issue
      minVersion: 'TLSv1'  // Use minimum TLS version 1.0
    },
    // Enable more logging for troubleshooting
    debug: true,
    logger: true,
    // Add retry configuration
    pool: true, // Use connection pooling
    maxConnections: 5,
    maxMessages: 100
  };
  
  console.log('SMTP Configuration:', {
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure,
    user: process.env.SMTP_USER,
    timeouts: {
      connection: smtpConfig.connectionTimeout,
      greeting: smtpConfig.greetingTimeout,
      socket: smtpConfig.socketTimeout
    }
  });
  
  // Create transport with improved settings
  try {
    transporter = nodemailer.createTransport(smtpConfig);

    // Set some default headers that can help with deliverability
    transporter.use('compile', (mail, callback) => {
      try {
        // Ensure we have headers
        if (!mail.data) {
          mail.data = {};
        }
        
        if (!mail.data.headers) {
          mail.data.headers = {};
        }
        
        // Set default sender if not specified
        if (!mail.data.from) {
          mail.data.from = {
            name: process.env.SENDER_NAME || 'Invest Up Support',
            address: process.env.SENDER_EMAIL
          };
        }
        
        // Add anti-spam headers
        mail.data.headers['X-Entity-Ref-ID'] = `invest-up-${Date.now()}`;
        mail.data.headers['X-Mailer'] = 'Invest Up Mailer';
        mail.data.headers['List-Unsubscribe'] = '<mailto:unsubscribe@investuptrading.com>';
        mail.data.headers['Precedence'] = 'bulk';
        
        // Prevent automatic replies
        mail.data.headers['X-Auto-Response-Suppress'] = 'OOF, AutoReply';
        
        callback();
      } catch (error) {
        console.error('Error in nodemailer compile plugin:', error);
        // Continue without failing
        callback();
      }
    });

    // Verify SMTP connection configuration
    transporter.verify()
      .then(() => console.log('SMTP connection with Brevo established successfully'))
      .catch(err => {
        console.error('SMTP connection error:', err);
        console.error('Check your Brevo SMTP credentials and configuration');
        console.log('Setting up fallback to preview mode...');
        
        // Fall back to preview mode if verification fails
        setupPreviewMode();
      });
  } catch (error) {
    console.error('Error creating nodemailer transport:', error);
    setupPreviewMode();
  }
}

// Function to set up preview mode when SMTP fails
function setupPreviewMode() {
  console.log('Falling back to preview mode due to SMTP configuration issues - emails will NOT be sent');
  
  transporter = {
    sendMail: (mailOptions) => {
      console.log('=======================================');
      console.log('EMAIL PREVIEW (SMTP failed, not actually sent):');
      console.log('From:', mailOptions.from);
      console.log('To:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
      console.log('=======================================');
      console.log('HTML content preview available in logs only');
      
      // Return a fake successful response but with a flag that it's in preview mode
      return Promise.resolve({
        messageId: `smtp-failed-preview-${Date.now()}@localhost`,
        preview: true,
        smtpFailed: true
      });
    }
  };
}

export default transporter;