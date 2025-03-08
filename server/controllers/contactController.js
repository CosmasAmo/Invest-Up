import Contact from '../models/Contact.js';
import User from '../models/userModel.js';
import transporter from '../config/nodemailer.js';

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

        // Create the contact message
        const contactMessage = await Contact.create({
            name,
            email,
            subject,
            message
        });
        
        // Send confirmation email to user
        const userMailOptions = {
            from: {
                name: 'Invest Up',
                address: process.env.SENDER_EMAIL
            },
            to: email,
            subject: 'Thank you for contacting us',
            html: `
                <h2>Thank you for contacting us, ${name}!</h2>
                <p>We have received your message regarding "${subject}".</p>
                <p>Our team will review your inquiry and respond as soon as possible.</p>
                <p>For reference, here's a copy of your message:</p>
                <blockquote>${message}</blockquote>
                <p>Best regards,<br>Invest Up Support Team</p>
            `
        };
        
        await transporter.sendMail(userMailOptions);
        
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

        // Send reply email
        const mailOptions = {
            from: {
                name: 'Invest Up',
                address: process.env.SENDER_EMAIL
            },
            to: message.email,
            subject: `Re: ${message.subject}`,
            html: `
                <h2>Hello ${message.name},</h2>
                <p>Thank you for your message. Here is our response:</p>
                <blockquote>${reply}</blockquote>
                <p>Best regards,<br>Invest Up Support Team</p>
            `
        };

        await transporter.sendMail(mailOptions);
        await message.update({ 
            reply,
            status: 'replied'
        });
        
        res.json({ success: true, message: 'Reply sent successfully' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}; 