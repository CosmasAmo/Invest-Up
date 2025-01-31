import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const adminAuth = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return res.json({ success: false, message: "Not authorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);

        if (!user || !user.isAdmin) {
            return res.json({ success: false, message: "Not authorized as admin" });
        }

        req.userId = decoded.id;
        next();
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export default adminAuth; 