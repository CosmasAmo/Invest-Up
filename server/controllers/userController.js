import User from '../models/userModel.js';
import Deposit from '../models/Deposit.js';
import Investment from '../models/Investment.js';
import Withdrawal from '../models/Withdrawal.js';
import Contact from "../models/Contact.js"; // Used for messages and contacts
import DeletedDeposit from '../models/deletedDepositModel.js';
import { Op } from "sequelize";
import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

export const getUserdata = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findByPk(userId);
        
        if(!user) {
            return res.json({success: false, message: 'User not found'});
        }

        // Fetch user's deposits
        const deposits = await Deposit.findAll({
            where: { 
                userId,
                status: {
                    [Op.in]: ['pending', 'approved']
                }
            },
            order: [['createdAt', 'DESC']],
            limit: 10 // Get last 10 transactions
        });

        // Calculate totals (only from approved deposits)
        const totalDeposits = deposits
            .filter(d => d.status === 'approved')
            .reduce((sum, d) => sum + parseFloat(d.amount), 0);

        // If user has a referrer, fetch their name
        let referrerName = null;
        if (user.referredBy) {
            const referrer = await User.findByPk(user.referredBy);
            referrerName = referrer ? referrer.name : null;
        }

        // Handle profile image - use either profileImage or profilePicture
        const profileImage = user.profileImage || null;
        const profilePicture = user.profilePicture || profileImage;

        // Validate paths - ensure they start with either http, https, or /uploads/
        const isValidImagePath = (path) => {
            return path && (
                path.startsWith('http://') || 
                path.startsWith('https://') || 
                path.startsWith('/uploads/')
            );
        };

        // Apply validation
        const validatedProfileImage = isValidImagePath(profileImage) ? profileImage : null;
        const validatedProfilePicture = isValidImagePath(profilePicture) ? profilePicture : null;

        return res.json({
            success: true,
            userData: {
                id: user.id,
                name: user.name,
                email: user.email,
                isAccountVerified: user.isAccountVerified,
                referralCode: user.referralCode,
                referralCount: user.referralCount,
                successfulReferrals: user.successfulReferrals || 0,
                referralEarnings: parseFloat(user.referralEarnings || 0).toFixed(2),
                balance: parseFloat(user.balance || 0).toFixed(2),
                profileImage: validatedProfileImage,
                profilePicture: validatedProfilePicture,
                recentTransactions: deposits.slice(0, 5), // Get last 5 transactions
                referredBy: referrerName,
                createdAt: user.createdAt
            },
            stats: {
                balance: parseFloat(user.balance || 0),
                referralEarnings: parseFloat(user.referralEarnings || 0),
                totalDeposits: totalDeposits,
                totalInvestments: 0,
                totalWithdrawals: 0
            }
        });

    } catch (error) {
        console.error('Error in getUserdata:', error);
        res.json({success: false, message: error.message});
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const userId = req.userId;
        const profileImage = req.file; // Get the uploaded file if any

        console.log('Update profile request:', { name, email, hasImage: !!profileImage });

        const user = await User.findByPk(userId);

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // If email is being changed, validate it
        if (email !== user.email) {
            // Validate email format and existence
            const validateEmail = (await import('../utils/emailValidator.js')).default;
            const emailValidation = await validateEmail(email);
            if (!emailValidation.isValid) {
                return res.json({ success: false, message: emailValidation.message });
            }
            
            // Check if email is already taken by another user
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.json({ success: false, message: 'Email already in use' });
            }
        }

        // Prepare update data
        const updateData = { name, email };
        
        // Handle profile image if uploaded
        if (profileImage) {
            // Store the image path in the database
            console.log('Profile image received:', profileImage.filename);
            const profileImagePath = '/uploads/' + profileImage.filename;
            console.log('Setting profile image path to:', profileImagePath);
            updateData.profileImage = profileImagePath;
            updateData.profilePicture = profileImagePath; // Update both fields for consistency
        }

        // Update the user's profile
        await user.update(updateData);

        // Get the updated user data
        const updatedUser = await User.findByPk(userId);

        // The Contact model no longer has a userId column as per the latest migration
        // Instead of trying to update by userId, we'll update by email
        if (user.email !== email) {
            try {
                // Update contacts that match the old email
                await Contact.update(
                    { email },
                    { where: { email: user.email } }
                );
            } catch (error) {
                console.log('Note: Could not update email in contacts:', error.message);
                // Continue execution even if this fails
            }
        }
        
        // Format user data to ensure consistent profile image fields
        const userData = updatedUser.toJSON();
        if (userData.profileImage && !userData.profilePicture) {
            userData.profilePicture = userData.profileImage;
        } else if (userData.profilePicture && !userData.profileImage) {
            userData.profileImage = userData.profilePicture;
        }

        // Validate paths - ensure they start with either http, https, or /uploads/
        const isValidImagePath = (path) => {
            return path && (
                path.startsWith('http://') || 
                path.startsWith('https://') || 
                path.startsWith('/uploads/')
            );
        };

        // Apply validation
        if (!isValidImagePath(userData.profileImage)) {
            userData.profileImage = null;
        }
        if (!isValidImagePath(userData.profilePicture)) {
            userData.profilePicture = null;
        }

        // Return success response with updated user data
        return res.json({ 
            success: true, 
            message: 'Profile updated successfully',
            userData: userData
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.json({ success: false, message: error.message });
    }
};

export const getDashboardData = async (req, res) => {
    try {
        const userId = req.userId;
        
        // Get user data
        const user = await User.findByPk(userId);
        
        // Ensure both profile image fields are properly set
        const userData = user.toJSON();
        if (userData.profileImage && !userData.profilePicture) {
            userData.profilePicture = userData.profileImage;
        } else if (userData.profilePicture && !userData.profileImage) {
            userData.profileImage = userData.profilePicture;
        }
        
        // Get investments data
        const investments = await Investment.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });

        // Calculate investment statistics
        const investmentStats = investments.reduce((acc, inv) => {
            if (inv.status === 'approved') {
                acc.totalInvestments += parseFloat(inv.amount);
                acc.totalProfit += parseFloat(inv.totalProfit || 0);
                acc.activeInvestments += 1;
            }
            return acc;
        }, { 
            totalInvestments: 0, 
            totalProfit: 0, 
            activeInvestments: 0 
        });

        // Get deposits data
        const deposits = await Deposit.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });

        // Calculate total from approved deposits
        const totalApprovedDeposits = deposits.reduce((acc, dep) => {
            if (dep.status === 'approved') {
                return acc + parseFloat(dep.amount);
            }
            return acc;
        }, 0);
        
        // Add deleted deposits from DeletedDeposit table
        const deletedDeposits = await DeletedDeposit.findAll({
            where: { userId }
        });
        
        const totalDeletedDeposits = deletedDeposits.reduce((acc, dep) => {
            return acc + parseFloat(dep.amount);
        }, 0);
        
        // Total deposits is the sum of approved and deleted deposits
        const totalDeposits = totalApprovedDeposits + totalDeletedDeposits;

        // Get total withdrawals
        const withdrawals = await Withdrawal.findAll({
            where: { userId }
        });
        
        const totalWithdrawals = withdrawals
            .filter(w => w.status === 'approved')
            .reduce((sum, w) => sum + Number(w.amount), 0);
        const pendingWithdrawals = withdrawals
            .filter(w => w.status === 'pending')
            .reduce((sum, w) => sum + Number(w.amount), 0);
        const completedWithdrawals = totalWithdrawals; // Only approved withdrawals count

        // Combine deposits and investments into recent transactions
        const allTransactions = [
            ...deposits.map(dep => ({
                id: dep.id,
                type: 'deposit',
                amount: dep.amount,
                status: dep.status,
                paymentMethod: dep.paymentMethod,
                proofImage: dep.proofImage,
                createdAt: dep.createdAt
            })),
            ...investments.map(inv => ({
                id: inv.id,
                type: 'investment',
                amount: inv.amount,
                status: inv.status,
                paymentMethod: 'Balance',
                proofImage: null,
                createdAt: inv.createdAt,
                dailyProfitRate: inv.dailyProfitRate,
                totalProfit: inv.totalProfit || 0
            })),
            ...withdrawals.map(withdrawal => ({
                id: withdrawal.id,
                type: 'withdrawal',
                amount: withdrawal.amount,
                status: withdrawal.status,
                paymentMethod: withdrawal.paymentMethod,
                walletAddress: withdrawal.walletAddress,
                createdAt: withdrawal.createdAt
            }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Count pending deposits
        const pendingDeposits = deposits.filter(dep => dep.status === 'pending').length;

        // Return with consistent user data
        res.json({
            success: true,
            user: {
                ...userData,
                successfulReferrals: userData.successfulReferrals || 0,
                recentTransactions: allTransactions.slice(0, 10), // Get last 10 transactions
                // Ensure both profile image fields are properly set
                profilePicture: userData.profilePicture || userData.profileImage || null,
                profileImage: userData.profileImage || userData.profilePicture || null
            },
            stats: {
                totalDeposits,
                totalInvestments: investmentStats.totalInvestments,
                totalProfit: investmentStats.totalProfit,
                activeInvestments: investmentStats.activeInvestments,
                referralEarnings: parseFloat(userData.referralEarnings || 0),
                pendingDeposits,
                totalWithdrawals,
                pendingWithdrawals,
                completedWithdrawals
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getUserDeposits = async (req, res) => {
    try {
        const userId = req.userId;
        
        // Fetch user's deposits
        const deposits = await Deposit.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            deposits
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getUserTransactions = async (req, res) => {
    try {
        const userId = req.userId;
        
        // Get user data for including in response
        const user = await User.findByPk(userId);
        
        // Get deposits data
        const deposits = await Deposit.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });

        // Get investments data
        const investments = await Investment.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });

        // Get withdrawals data
        const withdrawals = await Withdrawal.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });

        // Combine all transactions
        const allTransactions = [
            ...deposits.map(dep => ({
                id: dep.id,
                type: 'deposit',
                amount: dep.amount,
                status: dep.status,
                paymentMethod: dep.paymentMethod,
                proofImage: dep.proofImage,
                createdAt: dep.createdAt
            })),
            ...investments.map(inv => ({
                id: inv.id,
                type: 'investment',
                amount: inv.amount,
                status: inv.status,
                paymentMethod: 'Balance',
                proofImage: null,
                createdAt: inv.createdAt,
                dailyProfitRate: inv.dailyProfitRate,
                totalProfit: inv.totalProfit || 0
            })),
            ...withdrawals.map(withdrawal => ({
                id: withdrawal.id,
                type: 'withdrawal',
                amount: withdrawal.amount,
                status: withdrawal.status,
                paymentMethod: withdrawal.paymentMethod,
                walletAddress: withdrawal.walletAddress,
                createdAt: withdrawal.createdAt
            }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Calculate totals
        const totalDeposits = deposits
            .filter(dep => dep.status === 'approved')
            .reduce((sum, dep) => sum + parseFloat(dep.amount), 0);
            
        const totalWithdrawals = withdrawals
            .filter(w => w.status === 'approved')
            .reduce((sum, w) => sum + parseFloat(w.amount), 0);
            
        const totalInvestments = investments
            .filter(inv => inv.status === 'approved')
            .reduce((sum, inv) => sum + parseFloat(inv.amount), 0);

        // Format user data to ensure consistent profile image fields
        const userData = user ? user.toJSON() : {};
        if (userData.profileImage && !userData.profilePicture) {
            userData.profilePicture = userData.profileImage;
        } else if (userData.profilePicture && !userData.profileImage) {
            userData.profileImage = userData.profilePicture;
        }

        res.json({
            success: true,
            transactions: allTransactions,
            stats: {
                totalDeposits,
                totalWithdrawals,
                totalInvestments
            },
            userData: {
                name: userData.name,
                email: userData.email,
                profileImage: userData.profileImage,
                profilePicture: userData.profilePicture
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const markMessageAsRead = async (req, res) => {
    try {
        const { messageId } = req.body;
        const userId = req.user.id; // Ensure the message belongs to the user

        const message = await Contact.findOne({ where: { id: messageId, userId } });
        if (!message) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }

        await message.update({ isRead: true });
        res.json({ success: true, message: 'Message marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
