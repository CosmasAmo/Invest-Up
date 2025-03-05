import User from '../models/userModel.js';
import { Op } from 'sequelize';
import Deposit from '../models/Deposit.js';
import Investment from '../models/Investment.js';
import Withdrawal from '../models/Withdrawal.js';
import Contact from '../models/Contact.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { replyToMessage as sendReply } from './contactController.js';
import sequelize from '../config/database.js';
import { getSetting } from './settingsController.js';
import { v4 as uuidv4 } from 'uuid';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_PASSWORD
    }
});

export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.count();
        const verifiedUsers = await User.count({ where: { isAccountVerified: true } });
        const totalReferrals = await User.sum('referralCount');
        const totalReferralEarnings = await User.sum('referralEarnings');

        // Calculate total investments from all users
        const investments = await Investment.findAll({
            where: { status: 'approved' }
        });
        
        const totalInvestments = investments.reduce((sum, investment) => {
            return sum + parseFloat(investment.amount || 0);
        }, 0);

        const recentUsers = await User.findAll({
            order: [['createdAt', 'DESC']],
            limit: 5,
            attributes: ['id', 'name', 'email', 'createdAt', 'isAccountVerified']
        });

        const topReferrers = await User.findAll({
            where: { referralCount: { [Op.gt]: 0 } },
            order: [['referralCount', 'DESC']],
            limit: 5,
            attributes: ['id', 'name', 'email', 'referralCount', 'referralEarnings']
        });

        res.json({
            success: true,
            stats: {
                totalUsers,
                verifiedUsers,
                totalReferrals,
                totalReferralEarnings: parseFloat(totalReferralEarnings || 0).toFixed(2),
                totalInvestments: parseFloat(totalInvestments).toFixed(2)
            },
            recentUsers,
            topReferrers
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: [
                'id', 'name', 'email', 'isAccountVerified', 
                'referralCount', 'referralEarnings', 'balance',
                'createdAt'
            ],
            order: [['createdAt', 'DESC']]
        });

        // Get all approved investments
        const investments = await Investment.findAll({
            where: { status: 'approved' },
            attributes: ['userId', 'amount']
        });

        // Calculate total investments for each user
        const userInvestments = {};
        investments.forEach(investment => {
            const userId = investment.userId;
            const amount = parseFloat(investment.amount || 0);
            
            if (!userInvestments[userId]) {
                userInvestments[userId] = 0;
            }
            
            userInvestments[userId] += amount;
        });

        // Add total investments to each user
        const usersWithInvestments = users.map(user => {
            const userData = user.toJSON();
            userData.totalInvestments = parseFloat(userInvestments[user.id] || 0).toFixed(2);
            return userData;
        });

        res.json({ success: true, users: usersWithInvestments });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const updateUserStatus = async (req, res) => {
    const { userId, isVerified } = req.body;

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        await user.update({ isAccountVerified: isVerified });
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const handleDeposit = async (req, res) => {
    const { depositId, status } = req.body;
    
    try {
        const deposit = await Deposit.findByPk(depositId, {
            include: [{ model: User }]
        });
        
        if (!deposit) {
            return res.json({ success: false, message: 'Deposit not found' });
        }

        if (status === 'approved') {
            // Start a transaction to ensure data consistency
            await sequelize.transaction(async (t) => {
                // Update user's balance
                await deposit.User.increment('balance', { 
                    by: parseFloat(deposit.amount),
                    transaction: t 
                });
                
                // If user was referred, handle referral bonus
                if (deposit.User.referredBy) {
                    const referrer = await User.findByPk(deposit.User.referredBy, { transaction: t });
                    if (referrer) {
                        // Check if this is their first deposit
                        const previousDeposits = await Deposit.count({
                            where: {
                                userId: deposit.User.id,
                                status: 'approved',
                                id: { [Op.ne]: depositId }
                            },
                            transaction: t
                        });

                        if (previousDeposits === 0) {
                            // Increment successful referrals for referrer
                            await referrer.increment('successfulReferrals', { transaction: t });
                            await referrer.reload({ transaction: t });

                            // Get referrals required from settings
                            const referralsRequired = await getSetting('referralsRequired');
                            
                            // Award bonus when referrals reach the required number
                            if (referrer.successfulReferrals % referralsRequired === 0) {
                                const bonusAmount = await getSetting('referralBonus');
                                await Promise.all([
                                    referrer.increment('referralEarnings', { 
                                        by: bonusAmount,
                                        transaction: t 
                                    }),
                                    referrer.increment('balance', { 
                                        by: bonusAmount,
                                        transaction: t 
                                    })
                                ]);

                                // Log the bonus award
                                console.log(`Awarded $${bonusAmount} to referrer ${referrer.id} for reaching ${referrer.successfulReferrals} successful referrals`);
                            }
                        }
                    }
                }

                // Update deposit status
                await deposit.update({ status }, { transaction: t });
            });
            
            res.json({ 
                success: true, 
                message: `Deposit ${status}`,
                deposit
            });
        } else {
            // If not approving, just update the status
            await deposit.update({ status });
            res.json({ 
                success: true, 
                message: `Deposit ${status}`,
                deposit
            });
        }
    } catch (error) {
        console.error('Error handling deposit:', error);
        res.json({ success: false, message: error.message });
    }
};

export const getPendingDeposits = async (req, res) => {
    try {
        const deposits = await Deposit.findAll({
            where: { status: 'pending' },
            include: [{
                model: User,
                attributes: ['id', 'name', 'email']
            }],
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
                createdAt: deposit.createdAt,
                user: {
                    id: deposit.User.id,
                    name: deposit.User.name,
                    email: deposit.User.email
                }
            }))
        });
    } catch (error) {
        console.error('Error fetching pending deposits:', error);
        res.json({ success: false, message: error.message });
    }
};

export const getApprovedDeposits = async (req, res) => {
    try {
        const deposits = await Deposit.findAll({
            where: { status: 'approved' },
            include: [{
                model: User,
                attributes: ['id', 'name', 'email']
            }],
            order: [['createdAt', 'DESC']],
            limit: 50 // Limit to last 50 approved deposits
        });

        res.json({ 
            success: true, 
            deposits: deposits.map(deposit => ({
                id: deposit.id,
                amount: deposit.amount,
                paymentMethod: deposit.paymentMethod,
                proofImage: deposit.proofImage,
                status: deposit.status,
                createdAt: deposit.createdAt,
                user: {
                    id: deposit.User.id,
                    name: deposit.User.name,
                    email: deposit.User.email
                }
            }))
        });
    } catch (error) {
        console.error('Error fetching approved deposits:', error);
        res.json({ success: false, message: error.message });
    }
};

export const getPendingInvestments = async (req, res) => {
    try {
        const investments = await Investment.findAll({
            where: { status: 'pending' },
            include: [{
                model: User,
                attributes: ['id', 'name', 'email']
            }],
            order: [['createdAt', 'DESC']]
        });

        res.json({ 
            success: true, 
            investments: investments.map(investment => ({
                id: investment.id,
                amount: investment.amount,
                status: investment.status,
                createdAt: investment.createdAt,
                user: {
                    id: investment.User.id,
                    name: investment.User.name,
                    email: investment.User.email
                }
            }))
        });
    } catch (error) {
        console.error('Error fetching pending investments:', error);
        res.json({ success: false, message: error.message });
    }
};

export const getApprovedInvestments = async (req, res) => {
    try {
        const investments = await Investment.findAll({
            where: { status: 'approved' },
            include: [{
                model: User,
                attributes: ['id', 'name', 'email']
            }],
            order: [['createdAt', 'DESC']],
            limit: 50 // Limit to last 50 approved investments
        });

        res.json({ 
            success: true, 
            investments: investments.map(investment => ({
                id: investment.id,
                amount: investment.amount,
                status: investment.status,
                dailyProfitRate: investment.dailyProfitRate,
                totalProfit: investment.totalProfit,
                lastProfitUpdate: investment.lastProfitUpdate,
                createdAt: investment.createdAt,
                user: {
                    id: investment.User.id,
                    name: investment.User.name,
                    email: investment.User.email
                }
            }))
        });
    } catch (error) {
        console.error('Error fetching approved investments:', error);
        res.json({ success: false, message: error.message });
    }
};

export const handleInvestment = async (req, res) => {
    const { investmentId, status } = req.body;
    
    try {
        const investment = await Investment.findByPk(investmentId, {
            include: [{ model: User }]
        });
        
        if (!investment) {
            return res.json({ success: false, message: 'Investment not found' });
        }

        await investment.update({ 
            status,
            lastProfitUpdate: status === 'approved' ? new Date() : null
        });

        if (status === 'approved') {
            await investment.User.decrement('balance', { 
                by: parseFloat(investment.amount)
            });
            await investment.User.reload();
        }

        res.json({ 
            success: true, 
            message: `Investment ${status}`,
            investment
        });
    } catch (error) {
        console.error('Error handling investment:', error);
        res.json({ success: false, message: error.message });
    }
};

export const getPendingWithdrawals = async (req, res) => {
    try {
        const withdrawals = await Withdrawal.findAll({
            where: { status: 'pending' },
            include: [{
                model: User,
                attributes: ['id', 'name', 'email']
            }],
            order: [['createdAt', 'DESC']]
        });

        res.json({ 
            success: true, 
            withdrawals: withdrawals.map(withdrawal => ({
                id: withdrawal.id,
                amount: withdrawal.amount,
                paymentMethod: withdrawal.paymentMethod,
                walletAddress: withdrawal.walletAddress,
                status: withdrawal.status,
                createdAt: withdrawal.createdAt,
                user: {
                    id: withdrawal.User.id,
                    name: withdrawal.User.name,
                    email: withdrawal.User.email
                }
            }))
        });
    } catch (error) {
        console.error('Error fetching pending withdrawals:', error);
        res.json({ success: false, message: error.message });
    }
};

export const handleWithdrawal = async (req, res) => {
    const { withdrawalId, status } = req.body;
    
    try {
        // Get withdrawal fee from settings
        const withdrawalFee = await getSetting('withdrawalFee');
        
        const withdrawal = await Withdrawal.findByPk(withdrawalId, {
            include: [{ model: User }]
        });
        
        if (!withdrawal) {
            return res.json({ success: false, message: 'Withdrawal not found' });
        }

        // Check if user has sufficient balance when approving
        if (status === 'approved') {
            const totalDeduction = parseFloat(withdrawal.amount) + withdrawalFee;
            
            if (parseFloat(withdrawal.User.balance) < totalDeduction) {
                return res.json({ success: false, message: `User has insufficient balance (including $${withdrawalFee} fee)` });
            }
            
            // Deduct both amount and fee from user's balance
            await withdrawal.User.decrement('balance', { by: totalDeduction });
            await withdrawal.User.reload();
        }

        await withdrawal.update({ status });

        res.json({ 
            success: true, 
            message: `Withdrawal ${status}`,
            withdrawal: {
                ...withdrawal.toJSON(),
                fee: withdrawalFee,
                totalDeducted: parseFloat(withdrawal.amount) + withdrawalFee
            }
        });
    } catch (error) {
        console.error('Error handling withdrawal:', error);
        res.json({ success: false, message: error.message });
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

export const markAsRead = async (req, res) => {
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

export { sendReply as replyToMessage };

export const createUser = async (req, res) => {
  try {
    const { name, email, password, isAdmin, isAccountVerified } = req.body;
    
    // Validate email format and existence
    const validateEmail = (await import('../utils/emailValidator.js')).default;
    const emailValidation = await validateEmail(email);
    if (!emailValidation.isValid) {
      return res.json({ success: false, message: emailValidation.message });
    }
    
    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.json({ success: false, message: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate referral code
    const referralCode = crypto.randomBytes(4).toString('hex');

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isAdmin: isAdmin || false,
      isAccountVerified: isAccountVerified || false,
      referralCode
    });

    res.json({ success: true, user });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    await user.destroy();
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, isAdmin, isAccountVerified, balance } = req.body;
    
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
      
      // Check if email is taken by another user
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.json({ success: false, message: 'Email already exists' });
      }
    }

    await user.update({
      name,
      email,
      isAdmin,
      isAccountVerified,
      balance
    });

    res.json({ success: true, user });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getRecentTransactions = async (req, res) => {
    try {
        // Combine deposits, investments, and withdrawals into one list
        const deposits = await Deposit.findAll({
            include: [{
                model: User,
                attributes: ['id', 'name', 'email']
            }],
            order: [['createdAt', 'DESC']],
            limit: 20
        });
        
        const investments = await Investment.findAll({
            include: [{
                model: User,
                attributes: ['id', 'name', 'email']
            }],
            order: [['createdAt', 'DESC']],
            limit: 20
        });
        
        const withdrawals = await Withdrawal.findAll({
            include: [{
                model: User,
                attributes: ['id', 'name', 'email']
            }],
            order: [['createdAt', 'DESC']],
            limit: 20
        });

        // Combine and format all transactions
        const allTransactions = [
            ...deposits.map(dep => ({
                id: dep.id,
                type: 'deposit',
                amount: dep.amount,
                status: dep.status,
                paymentMethod: dep.paymentMethod,
                createdAt: dep.createdAt,
                user: {
                    id: dep.User.id,
                    name: dep.User.name,
                    email: dep.User.email
                }
            })),
            ...investments.map(inv => ({
                id: inv.id,
                type: 'investment',
                amount: inv.amount,
                status: inv.status,
                paymentMethod: 'Balance',
                createdAt: inv.createdAt,
                user: {
                    id: inv.User.id,
                    name: inv.User.name,
                    email: inv.User.email
                }
            })),
            ...withdrawals.map(wth => ({
                id: wth.id,
                type: 'withdrawal',
                amount: wth.amount,
                status: wth.status,
                paymentMethod: wth.paymentMethod,
                createdAt: wth.createdAt,
                user: {
                    id: wth.User.id,
                    name: wth.User.name,
                    email: wth.User.email
                }
            }))
        ]
        // Sort by date (newest first)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        // Limit to most recent 30 transactions
        .slice(0, 30);

        res.json({ 
            success: true, 
            transactions: allTransactions
        });
    } catch (error) {
        console.error('Error fetching recent transactions:', error);
        res.json({ success: false, message: error.message });
    }
}; 