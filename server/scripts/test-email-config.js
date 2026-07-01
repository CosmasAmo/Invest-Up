import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing Email Configuration...');
console.log('==============================');

// Display current configuration
console.log('Current SMTP Configuration:');
console.log('- SMTP_HOST:', process.env.SMTP_HOST || 'indra.vivawebhost.com');
console.log('- SMTP_PORT:', process.env.SMTP_PORT || '465');
console.log('- SMTP_USER:', process.env.SMTP_USER || 'accounts@investuptrading.com');
console.log('- SMTP_PASS:', process.env.SMTP_PASS ? '***SET***' : 'NOT SET');
console.log('- SENDER_EMAIL:', process.env.SENDER_EMAIL || 'accounts@investuptrading.com');

// Create transporter with the new configuration
const smtpConfig = {
    host: process.env.SMTP_HOST || 'indra.vivawebhost.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true, // Use SSL for port 465
    auth: {
        user: process.env.SMTP_USER || 'accounts@investuptrading.com',
        pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 20000,
    tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1'
    },
    debug: true,
    logger: true
};

console.log('\nCreating transporter with configuration:', {
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure,
    user: smtpConfig.auth.user
});

const transporter = nodemailer.createTransport(smtpConfig);

// Test the connection
console.log('\nTesting SMTP connection...');
transporter.verify()
    .then(() => {
        console.log('✅ SMTP connection successful!');
        
        // Test sending an email
        console.log('\nTesting email sending...');
        const testMailOptions = {
            from: {
                name: 'Invest Up Test',
                address: process.env.SENDER_EMAIL || 'accounts@investuptrading.com'
            },
            to: process.env.SENDER_EMAIL || 'accounts@investuptrading.com',
            subject: 'Test Email from Invest Up Server',
            text: 'This is a test email to verify the SMTP configuration is working correctly.',
            html: `
                <h2>Test Email</h2>
                <p>This is a test email to verify the SMTP configuration is working correctly.</p>
                <p><strong>Server:</strong> ${smtpConfig.host}</p>
                <p><strong>Port:</strong> ${smtpConfig.port}</p>
                <p><strong>User:</strong> ${smtpConfig.auth.user}</p>
                <p><strong>Time:</strong> ${new Date().toISOString()}</p>
            `
        };
        
        return transporter.sendMail(testMailOptions);
    })
    .then((info) => {
        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);
    })
    .catch((error) => {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
        
        if (error.code === 'EAUTH') {
            console.log('\n💡 Authentication failed. Please check:');
            console.log('1. Username: accounts@investuptrading.com');
            console.log('2. Password: Make sure SMTP_PASS environment variable is set correctly');
            console.log('3. Server: indra.vivawebhost.com');
            console.log('4. Port: 465');
        } else if (error.code === 'ECONNECTION') {
            console.log('\n💡 Connection failed. Please check:');
            console.log('1. Server: indra.vivawebhost.com');
            console.log('2. Port: 465');
            console.log('3. Firewall settings');
        }
    })
    .finally(() => {
        process.exit(0);
    }); 