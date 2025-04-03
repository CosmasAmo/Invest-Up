import Contact from '../models/Contact.js';
import User from '../models/userModel.js';
import transporter from '../config/nodemailer.js';
import nodemailer from 'nodemailer';

export const submitMessage = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        // Validate required fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }

        console.log(`Processing contact form submission from: ${name} <${email}>`);

        // Create the contact message
        const contactMessage = await Contact.create({
            name,
            email,
            subject,
            message
        });
        
        // Simplified confirmation email structure for better deliverability
        const userMailOptions = {
            from: {
                name: process.env.SENDER_NAME || 'Invest Up Support',
                address: process.env.SENDER_EMAIL
            },
            to: email,
            subject: 'Thank you for contacting us',
            text: `Thank you for contacting us, ${name}!

We have received your message regarding "${subject}".
Our team will review your inquiry and respond as soon as possible.

For reference, here's a copy of your message:
${message}

We typically respond to inquiries within 24-48 hours during business days.

Best regards,
Invest Up Support Team`,
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You For Contacting Us</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #333; }
        .container { max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; }
        .header { border-bottom: 2px solid #4A86E8; padding-bottom: 10px; margin-bottom: 20px; }
        .message { background-color: #f9f9f9; padding: 15px; border-left: 3px solid #4A86E8; margin-bottom: 15px; }
        .footer { font-size: 12px; color: #777; border-top: 1px solid #ddd; padding-top: 10px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Thank you for contacting us, ${name}!</h2>
        </div>
        
        <p>We have received your message regarding "${subject}".</p>
        <p>Our team will review your inquiry and respond as soon as possible.</p>
        
        <div class="message">
            <h3>For reference, here's a copy of your message:</h3>
            <p style="color: #555;">${message.replace(/\n/g, '<br>')}</p>
        </div>
        
        <p>We typically respond to inquiries within 24-48 hours during business days.</p>
        
        <div class="footer">
            <p>Best regards,<br>Invest Up Support Team</p>
        </div>
    </div>
</body>
</html>
            `
        };
        
        try {
            console.log('Sending confirmation email to:', email);
            const info = await transporter.sendMail(userMailOptions);
            console.log('Confirmation email sent successfully:', info.messageId);
        } catch (emailError) {
            // Log email error but continue with the request
            console.error('Failed to send confirmation email:', emailError);
            console.error('This error is non-fatal - message was saved to database');
        }
        
        res.json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error in submitMessage:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMessages = async (req, res) => {
    try {
        const messages = await Contact.findAll({
            order: [['createdAt', 'DESC']]
        });
        
        res.json({ success: true, messages });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const markMessageAsRead = async (req, res) => {
    try {
        const { messageId } = req.body;
        await Contact.update(
            { status: 'read' },
            { where: { id: messageId } }
        );
        
        res.json({ success: true, message: 'Message marked as read' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getUserMessages = async (req, res) => {
    try {
        const messages = await Contact.findAll({
            where: { userId: req.userId },
            include: [{
                model: User,
                attributes: ['id', 'name', 'email']
            }],
            order: [['createdAt', 'DESC']]
        });
        
        res.json({ success: true, messages });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const replyToMessage = async (req, res) => {
    try {
        const { messageId, reply } = req.body;
        const message = await Contact.findByPk(messageId);
        
        if (!message) {
            return res.json({ success: false, message: 'Message not found' });
        }

        console.log('Attempting to send reply to:', message.email);
        
        // First, update the message with the reply in the database
        // This ensures that even if email fails, the reply is saved
        await message.update({ 
            reply,
            status: 'replied'
        });
        
        // Create a unique message ID for tracking
        const emailMessageId = `reply-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        
        // Enhanced logging for troubleshooting
        console.log('Email configuration when attempting to send reply:');
        console.log('- SMTP_HOST:', process.env.SMTP_HOST || 'not set');
        console.log('- SMTP_PORT:', process.env.SMTP_PORT || 'not set');
        console.log('- SENDER_EMAIL:', process.env.SENDER_EMAIL || 'not set');
        console.log('- SMTP_USER:', process.env.SMTP_USER ? 'set' : 'not set');
        console.log('- SMTP_PASS:', process.env.SMTP_PASS ? 'set' : 'not set');
        
        // Simplified email structure for better deliverability
        const mailOptions = {
            from: {
                name: process.env.SENDER_NAME || 'Invest Up Support',
                address: process.env.SENDER_EMAIL
            },
            to: message.email,
            subject: `Re: ${message.subject}`,
            text: `Hello ${message.name},

Thank you for contacting Invest Up support. We've reviewed your message and have the following response:

YOUR ORIGINAL MESSAGE:
${message.message}

OUR RESPONSE:
${reply}

If you have any further questions, please don't hesitate to contact us again.

Best regards,
Invest Up Support Team`,
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Response from Invest Up</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #333; }
        .container { max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; }
        .header { border-bottom: 2px solid #4A86E8; padding-bottom: 10px; margin-bottom: 20px; }
        .message { background-color: #f9f9f9; padding: 15px; border-left: 3px solid #4A86E8; margin-bottom: 15px; }
        .footer { font-size: 12px; color: #777; border-top: 1px solid #ddd; padding-top: 10px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Hello ${message.name},</h2>
        </div>
        
        <p>Thank you for contacting Invest Up support. We've reviewed your message and have the following response:</p>
        
        <div class="message">
            <h3>Your original message:</h3>
            <p style="color: #555;">${message.message.replace(/\n/g, '<br>')}</p>
            
            <h3>Our response:</h3>
            <p>${reply.replace(/\n/g, '<br>')}</p>
        </div>
        
        <p>If you have any further questions, please don't hesitate to contact us again.</p>
        
        <div class="footer">
            <p>Best regards,<br>Invest Up Support Team</p>
        </div>
    </div>
</body>
</html>
            `
        };

        try {
            console.log('SMTP configuration for reply:', {
                host: process.env.SMTP_HOST || 'smtp-brevo.com',
                port: process.env.SMTP_PORT || '587',
                user: process.env.SMTP_USER,
                sender: process.env.SENDER_EMAIL,
                recipient: message.email
            });
            
            // Attempt to send the email
            const info = await transporter.sendMail(mailOptions);
            
            // Check if we're in preview mode (email not actually sent)
            if (info.preview) {
                console.log('Email in preview mode or SMTP connection failed. Message stored but email not sent.');
                
                // Return partial success since the reply was saved but email isn't sent in preview mode
                return res.json({ 
                    success: true, 
                    message: 'Reply saved but email delivery is in preview mode. The message will be available in the user\'s dashboard.',
                    emailSent: false,
                    emailError: 'SMTP server not available or in preview mode'
                });
            }
            
            console.log('Reply email sent successfully:', info.messageId);
            
            // Always return success since the reply was saved in the database
            return res.json({ 
                success: true, 
                message: 'Reply sent successfully',
                emailSent: true
            });
        } catch (emailError) {
            console.error('Failed to send reply email:', emailError);
            console.error('Email details:', {
                to: message.email,
                subject: mailOptions.subject,
                error: emailError.message,
                code: emailError.code
            });
            
            // Return partial success since the reply was saved but email failed
            return res.json({ 
                success: true, 
                message: 'Reply saved but could not be sent via email. User will see the reply when they log in.',
                emailSent: false,
                emailError: emailError.message
            });
        }
    } catch (error) {
        console.error('Error in replyToMessage:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}; 