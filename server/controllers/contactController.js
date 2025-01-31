import Contact from '../models/Contact.js';
import User from '../models/userModel.js';

export const submitMessage = async (req, res) => {
    try {
        const { subject, message } = req.body;
        if (!req.userId) {
            return res.status(400).json({ success: false, message: 'User ID is missing' });
        }

        // Fetch the user's email
        const user = await User.findByPk(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await Contact.create({
            userId: req.userId,
            email: user.email, // Include the user's email
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