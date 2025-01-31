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

export default authRouter;