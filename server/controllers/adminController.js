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
                totalReferralEarnings: parseFloat(totalReferralEarnings || 0).toFixed(2)
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

        res.json({ success: true, users });
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
            // Update user's balance
            await deposit.User.increment('balance', { by: parseFloat(deposit.amount) });
            
            // If this is user's first approved deposit and they were referred
            if (deposit.User.referredBy) {
                const referrer = await User.findByPk(deposit.User.referredBy);
                if (referrer) {
                    // Check if this is their first deposit
                    const previousDeposits = await Deposit.count({
                        where: {
                            userId: deposit.User.id,
                            status: 'approved',
                            id: { [Op.ne]: depositId }
                        }
                    });

                    if (previousDeposits === 0) {
                        // Increment successful referrals
                        await referrer.increment('successfulReferrals');
                        await referrer.reload();

                        // If they now have 2 successful referrals and haven't received bonus
                        if (referrer.successfulReferrals % 2 === 0) {
                            await referrer.increment('referralEarnings', { by: 5.00 });
                            await referrer.increment('balance', { by: 5.00 });
                        }
                    }
                }
            }
        }

        await deposit.update({ status });
        
        res.json({ 
            success: true, 
            message: `Deposit ${status}`,
            deposit
        });
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
    const withdrawalFee = 2.00;
    
    try {
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
                return res.json({ success: false, message: 'User has insufficient balance (including $2 fee)' });
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

    // Check if email is taken by another user
    if (email !== user.email) {
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