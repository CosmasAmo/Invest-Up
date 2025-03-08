import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false
    },
    // Set default sender information
    defaults: {
        from: {
            name: 'Invest Up',
            address: process.env.SENDER_EMAIL
        }
    }
});

export default transporter;