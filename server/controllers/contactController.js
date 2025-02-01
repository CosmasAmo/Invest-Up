import Contact from '../models/Contact.js';
import User from '../models/userModel.js';
import transporter from '../config/nodemailer.js';

export const submitMessage = async (req, res) => {
    try {
        const { email, subject, message } = req.body;
        
        // Validate required fields
        if (!email || !subject || !message) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email, subject and message are required' 
            });
        }

        // Create the contact message
        await Contact.create({
            userId: req.userId || null, // This is already correct
            email,
            subject,
            message
        });
        
        res.json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error in submitMessage:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMessages = async (req, res) => {
    try {
        const messages = await Contact.findAll({
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
            from: process.env.SENDER_EMAIL,
            to: message.email,
            subject: `Re: ${message.subject}`,
            text: reply
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