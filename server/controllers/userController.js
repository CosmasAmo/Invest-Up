import User from "../models/userModel.js";
import Deposit from "../models/Deposit.js";
import Investment from "../models/Investment.js";
import Withdrawal from "../models/Withdrawal.js";
import { Op } from "sequelize";
import Contact from "../models/Contact.js";

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

        return res.json({
            success: true,
            userData: {
                id: user.id,
                name: user.name,
                email: user.email,
                isAccountVerified: user.isAccountVerified,
                referralCode: user.referralCode,
                referralCount: user.referralCount,
                referralEarnings: parseFloat(user.referralEarnings || 0).toFixed(2),
                balance: parseFloat(user.balance || 0).toFixed(2),
                recentTransactions: deposits.slice(0, 5), // Get last 5 transactions
                referredBy: referrerName
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

        const user = await User.findByPk(userId);

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Check if email is already taken by another user
        if (email !== user.email) {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.json({ success: false, message: 'Email already in use' });
            }
        }

        // Update the user's profile
        await user.update({ name, email });

        // Update the email in the Contacts table for all messages associated with this user
        await Contact.update(
            { email },
            { where: { userId } }
        );

        return res.json({
            success: true,
            message: 'Profile updated successfully'
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getDashboardData = async (req, res) => {
    try {
        const userId = req.userId;
        
        // Get user data
        const user = await User.findByPk(userId);
        
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

        const totalDeposits = deposits.reduce((acc, dep) => {
            if (dep.status === 'approved') {
                return acc + parseFloat(dep.amount);
            }
            return acc;
        }, 0);

        // Get total withdrawals
        const withdrawals = await Withdrawal.findAll({
            where: { userId }
        });
        
        const totalWithdrawals = withdrawals.reduce((sum, w) => sum + Number(w.amount), 0);
        const pendingWithdrawals = withdrawals
            .filter(w => w.status === 'pending')
            .reduce((sum, w) => sum + Number(w.amount), 0);
        const completedWithdrawals = withdrawals
            .filter(w => w.status === 'approved')
            .reduce((sum, w) => sum + Number(w.amount), 0);

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
            }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Count pending deposits
        const pendingDeposits = deposits.filter(dep => dep.status === 'pending').length;

        res.json({
            success: true,
            user: {
                ...user.toJSON(),
                recentTransactions: allTransactions.slice(0, 10) // Get last 10 transactions
            },
            stats: {
                totalDeposits,
                totalInvestments: investmentStats.totalInvestments,
                totalProfit: investmentStats.totalProfit,
                activeInvestments: investmentStats.activeInvestments,
                referralEarnings: parseFloat(user.referralEarnings || 0),
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
        
        const deposits = await Deposit.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });

        res.json({ 
            success: true, 
            deposits: deposits.map(deposit => ({
                id: deposit.id,
                amount: deposit.amount,
                paymentMethod: deposit.paymentMethod,
                proofImage: deposit.proofImage,
                status: deposit.status,
                createdAt: deposit.createdAt
            }))
        });
    } catch (error) {
        console.error('Error fetching user deposits:', error);
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
