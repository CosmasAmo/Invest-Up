import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const userAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        
        if (!token) {
            return res.json({ success: false, message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // List of routes that require email verification
        const verificationRequiredRoutes = [
            '/api/user/invest',
            '/api/user/withdraw',
            '/api/user/deposit'
        ];

        // Only check email verification for specific routes
        if (verificationRequiredRoutes.includes(req.originalUrl) && !user.isEmailVerified) {
            return res.json({ 
                success: false, 
                message: 'Please verify your email first',
                requiresVerification: true 
            });
        }

        req.userId = user.id;
        next();
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export default userAuth;