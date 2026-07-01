import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const userAuth = async (req, res, next) => {
    try {
        // Get token from cookies or Authorization header
        let token = req.cookies.token;
        
        // Check Authorization header if no cookie token (for mobile clients)
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
                console.log('Got token from Authorization header, prefix:', token.substring(0, 10) + '...');
            }
        }
        
        if (!token) {
            console.log('No token provided in request');
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        console.log('Decoding token, URL path:', req.originalUrl);
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Decoded user ID:', decoded.id);
            
            const user = await User.findByPk(decoded.id);
            
            if (!user) {
                console.log(`User not found with ID from token: ${decoded.id}`);
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            console.log(`User authenticated: ${user.email} (ID: ${user.id})`);
            console.log(`User verification status: isAccountVerified=${user.isAccountVerified}, verifyOtp=${user.verifyOtp ? 'present' : 'empty'}`);

            // List of routes that require email verification
            const verificationRequiredRoutes = [
                '/api/user/invest',
                '/api/user/withdraw',
                '/api/user/deposit'
            ];

            // Only check email verification for specific routes
            if (verificationRequiredRoutes.includes(req.originalUrl) && !user.isEmailVerified) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'Please verify your email first',
                    requiresVerification: true 
                });
            }

            req.userId = user.id;
            next();
        } catch (jwtError) {
            console.error('JWT verification error:', jwtError);
            return res.status(401).json({ success: false, message: 'Invalid or expired token' });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}

export default userAuth;