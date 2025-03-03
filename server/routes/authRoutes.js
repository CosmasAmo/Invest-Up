import express from 'express';
import {isAuthenticated, register, resetPassword, sendResetOtp, verifyEmail, registerWithReferral, checkAuth} from '../controllers/authController.js';
import {login} from '../controllers/authController.js';
import {logout} from '../controllers/authController.js';
import userAuth from '../middleware/userAuth.js';
import passport from '../config/googleAuth.js';
import jwt from 'jsonwebtoken';

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/verify-account', userAuth, verifyEmail);
authRouter.post('/is-auth', userAuth, isAuthenticated);
authRouter.post('/send-reset-otp', sendResetOtp);
authRouter.post('/reset-password', resetPassword);
authRouter.post('/register-with-referral', registerWithReferral);
authRouter.get('/check', checkAuth);

authRouter.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

authRouter.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login' }),
    async (req, res) => {
        try {
            const token = jwt.sign(
                { id: req.user.id }, 
                process.env.JWT_SECRET, 
                { expiresIn: '7days' }
            );

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            // Redirect to frontend dashboard
            res.redirect('http://localhost:5173/dashboard');
        } catch (error) {
            res.redirect('http://localhost:5173/login?error=Authentication failed');
        }
    }
);

// Add a debug route to check authentication status
authRouter.get('/debug-auth', (req, res) => {
    // Get token from cookies or Authorization header
    let token = req.cookies.token;
    
    // Check Authorization header if no cookie token (for mobile clients)
    let authHeaderToken = null;
    if (req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith('Bearer ')) {
            authHeaderToken = authHeader.substring(7);
        }
    }
    
    res.json({
        success: true,
        hasCookie: !!token,
        hasAuthHeader: !!authHeaderToken,
        cookieValue: token ? 'Present (hidden for security)' : 'Not present',
        authHeaderValue: authHeaderToken ? 'Present (hidden for security)' : 'Not present',
        cookies: req.cookies,
        headers: {
            origin: req.headers.origin,
            referer: req.headers.referer,
            host: req.headers.host,
            userAgent: req.headers['user-agent']
        }
    });
});

// Add a mobile-specific test endpoint
authRouter.get('/mobile-test', (req, res) => {
    res.json({
        success: true,
        message: 'Mobile API is working correctly',
        timestamp: new Date().toISOString(),
        headers: {
            userAgent: req.headers['user-agent'],
            authorization: req.headers.authorization ? 'Present (hidden)' : 'Not present'
        }
    });
});

export default authRouter;