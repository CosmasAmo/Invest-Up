import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// More extensive logging
console.log('Email configuration:');
console.log('- SMTP_HOST:', process.env.SMTP_HOST || 'not set');
console.log('- SMTP_PORT:', process.env.SMTP_PORT || 'not set');
console.log('- SENDER_EMAIL:', process.env.SENDER_EMAIL || 'not set');
console.log('- SMTP_USER:', process.env.SMTP_USER ? 'set' : 'not set');
console.log('- SMTP_PASS:', process.env.SMTP_PASS ? 'set' : 'not set');

// Function to set up preview mode
const setupPreviewMode = () => {
  console.log('Email credentials not provided - using preview mode (emails will NOT be sent)');
  
  // Create a preview/development transport that doesn't actually send emails
  return {
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
    },
    verify: () => Promise.resolve(true)
  };
};

// Function to create the actual transporter
const createTransporter = () => {
  // Check if we're in development mode or if email credentials are missing
  if (process.env.NODE_ENV === 'development' && !process.env.SMTP_USER) {
    return setupPreviewMode();
  } else if (!process.env.SMTP_USER || !process.env.SMTP_PASS || process.env.SMTP_USER === '' || process.env.SMTP_PASS === '') {
    return setupPreviewMode();
  } else {
    console.log('Using cPanel SMTP for email delivery');
    
    // Enhanced SMTP configuration with better error handling
    const smtpConfig = {
      host: process.env.SMTP_HOST || 'indra.vivawebhost.com', // Updated to use the new server
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: parseInt(process.env.SMTP_PORT || '587') === 465, // Use SSL only for port 465
      auth: {
        user: process.env.SMTP_USER || 'accounts@investuptrading.com',
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
      const transporter = nodemailer.createTransport(smtpConfig);

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
              address: process.env.SENDER_EMAIL || 'accounts@investuptrading.com'
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

      // Add a custom method to save emails to sent folder
      transporter.saveToSentFolder = async (mailOptions) => {
        try {
          // First send the email normally
          const result = await transporter.sendMail(mailOptions);
          
          // For now, just log that we attempted to save to sent folder
          // The actual saving will be handled by the email server configuration
          console.log('Email sent successfully. To save to sent folder, configure your email client to save sent emails.');
          console.log('Email details:', {
            from: mailOptions.from,
            to: mailOptions.to,
            subject: mailOptions.subject,
            messageId: result.messageId
          });
          
          return result;
        } catch (error) {
          console.error('Error in saveToSentFolder:', error);
          throw error;
        }
      };

      // Verify SMTP connection configuration (but don't block the export)
      transporter.verify()
        .then(() => console.log('SMTP connection with cPanel established successfully'))
        .catch(err => {
          console.error('SMTP connection error:', err);
          console.error('Check your cPanel SMTP credentials and configuration');
          console.log('Setting up fallback to preview mode...');
          
          // Note: We can't replace the transporter here, but we can log the error
          // The transporter will still work but might fail when sending emails
        });

      return transporter;
    } catch (error) {
      console.error('Error creating nodemailer transport:', error);
      return setupPreviewMode();
    }
  }
};

// Create and export the transporter
const transporter = createTransporter();
export default transporter;