import User from '../models/userModel.js';
import { Op } from 'sequelize';
import Deposit from '../models/Deposit.js';
import Investment from '../models/Investment.js';
import Withdrawal from '../models/Withdrawal.js';
import Contact from '../models/Contact.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { replyToMessage as sendReply } from './contactController.js';
import sequelize from '../config/database.js';
import { getSetting } from './settingsController.js';
import validateEmail from '../utils/emailValidator.js';
import transporter from '../config/nodemailer.js';

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
        console.log('Getting all users...');
        const users = await User.findAll({
            attributes: [
                'id', 'name', 'email', 'isAccountVerified', 
                'referralCount', 'referralEarnings', 'balance',
                'createdAt', 'isAdmin', 'profilePicture'
            ],
            order: [['createdAt', 'DESC']]
        });

        console.log('Users found:', users.length);
        
        // Get all approved investments, excluding deleted ones
        const investments = await Investment.findAll({
            where: { status: 'approved' },
            attributes: ['userId', 'amount', 'totalProfit']
        });

        // Get all approved withdrawals, excluding deleted ones
        const withdrawals = await Withdrawal.findAll({
            where: { status: 'approved' },
            attributes: ['userId', 'amount']
        });

        // Calculate total investments and profits for each user
        const userInvestments = {};
        const userProfits = {};
        investments.forEach(investment => {
            const userId = investment.userId;
            const amount = parseFloat(investment.amount || 0);
            const profit = parseFloat(investment.totalProfit || 0);
            
            if (!userInvestments[userId]) {
                userInvestments[userId] = 0;
                userProfits[userId] = 0;
            }
            
            userInvestments[userId] += amount;
            userProfits[userId] += profit;
        });

        // Calculate total withdrawals for each user
        const userWithdrawals = {};
        withdrawals.forEach(withdrawal => {
            const userId = withdrawal.userId;
            const amount = parseFloat(withdrawal.amount || 0);
            
            if (!userWithdrawals[userId]) {
                userWithdrawals[userId] = 0;
            }
            
            userWithdrawals[userId] += amount;
        });

        // Add total investments, profits, and withdrawals to each user
        const usersWithData = users.map(user => {
            const userData = user.toJSON();
            userData.totalInvestments = parseFloat(userInvestments[user.id] || 0).toFixed(2);
            userData.totalProfits = parseFloat(userProfits[user.id] || 0).toFixed(2);
            userData.totalWithdrawals = parseFloat(userWithdrawals[user.id] || 0).toFixed(2);
            return userData;
        });

        res.json({ success: true, users: usersWithData });
    } catch (error) {
        console.error('Error getting all users:', error);
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
        console.log(`Processing deposit ${depositId} with status ${status}`);
        
        const deposit = await Deposit.findByPk(depositId, {
            include: [{ model: User }]
        });
        
        if (!deposit) {
            console.log(`Deposit ${depositId} not found`);
            return res.json({ success: false, message: 'Deposit not found' });
        }

        if (status === 'approved') {
            // Check if the deposit is already approved to prevent double processing
            if (deposit.status === 'approved') {
                console.log(`Deposit ${depositId} is already approved`);
                return res.json({ 
                    success: false, 
                    message: 'This deposit has already been approved' 
                });
            }
            
            console.log(`Starting transaction for deposit ${depositId}`);
            // Start a transaction to ensure data consistency
            await sequelize.transaction(async (t) => {
                const currentBalance = parseFloat(deposit.User.balance);
                const depositAmount = parseFloat(deposit.amount);
                console.log(`Current balance: ${currentBalance}, Adding: ${depositAmount}`);
                
                // Update user's balance
                await deposit.User.increment('balance', { 
                    by: depositAmount,
                    transaction: t 
                });
                
                // Reload user to get updated balance
                await deposit.User.reload({ transaction: t });
                console.log(`New balance after increment: ${deposit.User.balance}`);
                
                // If user was referred, handle referral bonus
                if (deposit.User.referredBy) {
                    console.log(`Processing referral bonus for user ${deposit.User.id}`);
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
                            console.log(`First deposit for user ${deposit.User.id}, processing referral bonus`);
                            // Increment successful referrals for referrer
                            await referrer.increment('successfulReferrals', { transaction: t });
                            await referrer.reload({ transaction: t });

                            // Get referrals required from settings
                            const referralsRequired = await getSetting('referralsRequired');
                            
                            // Award bonus when referrals reach the required number
                            if (referrer.successfulReferrals % referralsRequired === 0) {
                                const bonusAmount = await getSetting('referralBonus');
                                console.log(`Awarding bonus of ${bonusAmount} to referrer ${referrer.id}`);
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

                                // Reload referrer to get latest data after updates
                                await referrer.reload({ transaction: t });
                                console.log(`Referrer ${referrer.id} new referralEarnings: ${referrer.referralEarnings}, balance: ${referrer.balance}, successfulReferrals: ${referrer.successfulReferrals}`);

                                // Log the bonus award
                                console.log(`Awarded $${bonusAmount} to referrer ${referrer.id} for reaching ${referrer.successfulReferrals} successful referrals`);
                            }
                        }
                    }
                }

                // Update deposit status
                await deposit.update({ status }, { transaction: t });
                console.log(`Deposit ${depositId} status updated to ${status}`);
            });
            
            console.log(`Successfully processed deposit ${depositId}`);
            res.json({ 
                success: true, 
                message: `Deposit ${status}`,
                deposit
            });
        } else {
            // If not approving, just update the status
            await deposit.update({ status });
            console.log(`Deposit ${depositId} status updated to ${status}`);
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

        // Get daily profit rate from settings when approving an investment
        let dailyProfitRate = null;
        if (status === 'approved') {
            dailyProfitRate = await getSetting('profitPercentage');
            if (!dailyProfitRate) {
                return res.json({ success: false, message: 'Profit percentage not set in settings' });
            }
        }

        await investment.update({ 
            status,
            lastProfitUpdate: status === 'approved' ? new Date() : null,
            dailyProfitRate: status === 'approved' ? dailyProfitRate : null,
            totalProfit: status === 'approved' ? 0.00 : investment.totalProfit
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

        // No need to check balance or deduct again since it was already done during request
        await withdrawal.update({ status });

        // If rejected, return the amount to user's balance (including the fee)
        if (status === 'rejected') {
            const totalAmount = parseFloat(withdrawal.amount) + withdrawalFee;
            await withdrawal.User.increment('balance', { by: totalAmount });
            await withdrawal.User.reload();
        }

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
    const emailValidation = validateEmail(email);
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
    
    // Handle profile image if uploaded
    const profileImage = req.file ? req.file.filename : null;

    // Generate referral code only for non-admin users
    const referralCode = isAdmin ? null : crypto.randomBytes(4).toString('hex');

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isAdmin: isAdmin || false,
      isAccountVerified: isAccountVerified || false,
      referralCode,
      profileImage: profileImage ? '/uploads/' + profileImage : null
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
    const { name, email, password, isAdmin, isAccountVerified } = req.body;
    
    console.log('Updating user:', userId);
    console.log('Request body:', req.body);
    console.log('isAdmin value:', isAdmin);
    console.log('File upload:', req.file);
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    // If email is being changed, validate it
    if (email !== user.email) {
      // Validate email format and existence
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        return res.json({ success: false, message: emailValidation.message });
      }
      
      // Check if email is taken by another user
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser && existingUser.id !== user.id) {
        return res.json({ success: false, message: 'Email already exists' });
      }
    }

    // Convert isAdmin to boolean if it's a string
    const isAdminBoolean = typeof isAdmin === 'string' 
      ? isAdmin === 'true' 
      : Boolean(isAdmin);
    
    console.log('isAdmin after conversion:', isAdminBoolean);

    // Handle profile image if uploaded
    let profileImage = user.profileImage || user.profilePicture;
    if (req.file) {
      console.log('New profile image uploaded:', req.file.filename);
      profileImage = '/uploads/' + req.file.filename;
    }

    // Prepare update data
    const updateData = {
      name,
      email,
      isAdmin: isAdminBoolean,
      isAccountVerified,
      profileImage,
      profilePicture: profileImage // Update both fields for consistency
    };

    // Balance can only be modified by system processes, not directly by admin
    console.log('Update data:', updateData);

    // If password is provided, hash it and add to update data
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
      console.log('Password updated for user');
    }

    // Update user with prepared data
    await user.update(updateData);

    // Get the updated user data
    const updatedUser = await User.findByPk(userId);
    console.log('Updated user data:', updatedUser);

    // Format user data to ensure consistent profile image fields
    const userData = updatedUser.toJSON();
    
    // Ensure both profile image fields are consistently set
    if (userData.profileImage && !userData.profilePicture) {
      userData.profilePicture = userData.profileImage;
    } else if (userData.profilePicture && !userData.profileImage) {
      userData.profileImage = userData.profilePicture;
    }

    res.json({ 
      success: true, 
      message: 'User updated successfully',
      user: userData
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.json({ success: false, message: error.message });
  }
};

export const getRecentTransactions = async (req, res) => {
    try {
        // Recent deposits
        const deposits = await Deposit.findAll({
            where: { status: 'approved' },
            order: [['updatedAt', 'DESC']],
            limit: 5,
            include: [{ model: User, attributes: ['name', 'email'] }]
        });

        // Recent investments
        const investments = await Investment.findAll({
            where: { status: 'approved' },
            order: [['updatedAt', 'DESC']],
            limit: 5,
            include: [{ model: User, attributes: ['name', 'email'] }]
        });

        // Recent withdrawals
        const withdrawals = await Withdrawal.findAll({
            where: { status: 'approved' },
            order: [['updatedAt', 'DESC']],
            limit: 5,
            include: [{ model: User, attributes: ['name', 'email'] }]
        });

        // Combine and sort all transactions
        const allTransactions = [
            ...deposits.map(d => {
                const json = d.toJSON();
                return {
                    ...json,
                    type: 'deposit',
                    user: json.User ? {
                        name: json.User.name,
                        email: json.User.email
                    } : null
                };
            }),
            ...investments.map(i => {
                const json = i.toJSON();
                return {
                    ...json,
                    type: 'investment',
                    user: json.User ? {
                        name: json.User.name,
                        email: json.User.email
                    } : null
                };
            }),
            ...withdrawals.map(w => {
                const json = w.toJSON();
                return {
                    ...json,
                    type: 'withdrawal',
                    user: json.User ? {
                        name: json.User.name,
                        email: json.User.email
                    } : null
                };
            })
        ];

        // Sort by updatedAt (most recent first)
        allTransactions.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        // Return top 10 transactions
        const transactions = allTransactions.slice(0, 10);

        res.json({
            success: true,
            transactions
        });
    } catch (error) {
        console.error('Error fetching recent transactions:', error);
        res.json({ success: false, message: error.message });
    }
};

export const getUserReferralCodes = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'name', 'email', 'referralCode'],
            where: {
                // Only include users with a referral code
                referralCode: {
                    [Op.not]: null
                }
            },
            order: [['name', 'ASC']]
        });
        
        // Format response as a map of userId -> referralCode
        const referralCodes = {};
        users.forEach(user => {
            referralCodes[user.id] = user.referralCode;
        });
        
        res.json({ success: true, referralCodes });
    } catch (error) {
        console.error('Error getting user referral codes:', error);
        res.json({ success: false, message: error.message });
    }
};

// Add missing getUser function
export const getUser = async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }
        
        const user = await User.findByPk(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                isAccountVerified: user.isAccountVerified,
                referralCode: user.referralCode,
                referralCount: user.referralCount,
                referralEarnings: user.referralEarnings,
                balance: user.balance,
                profilePicture: user.profilePicture || user.profileImage,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Error getting user details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve user details',
            error: error.message
        });
    }
};

// Add a test email function to help diagnose email deliverability issues
export const testEmail = async (req, res) => {
    try {
        const { testEmail } = req.body;
        
        if (!testEmail) {
            return res.status(400).json({ 
                success: false, 
                message: 'Test email address is required' 
            });
        }
        
        console.log('Attempting to send test email to:', testEmail);
        
        // Simplified email for better deliverability
        const mailOptions = {
            from: {
                name: process.env.SENDER_NAME || 'Invest Up Support',
                address: process.env.SENDER_EMAIL
            },
            to: testEmail,
            subject: 'Invest Up Email Test',
            text: `This is a test email from Invest Up

This email was sent to verify that the email delivery system is working correctly.

Email Configuration:
- SMTP Host: ${process.env.SMTP_HOST || 'smtp-brevo.com'}
- SMTP Port: ${process.env.SMTP_PORT || '587'}
- Sender Email: ${process.env.SENDER_EMAIL}
- Test Time: ${new Date().toISOString()}

If you received this email, it means that your email delivery system is working correctly!

Best regards,
Invest Up Support Team`,
            html: `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Invest Up - Email Test</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" type="text/css">
  <style type="text/css">
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
      color: #1a202c;
      line-height: 1.6;
    }

    table, td {
      border-collapse: collapse;
    }

    .email-wrapper {
      width: 100%;
      min-height: 100vh;
      padding: 20px 0;
    }

    .email-container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .email-header {
      background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
      padding: 40px 30px;
      text-align: center;
      position: relative;
    }

    .brand-name {
      color: #ffffff;
      margin: 0;
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.5px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .brand-tagline {
      color: rgba(255, 255, 255, 0.9);
      margin: 8px 0 0 0;
      font-size: 16px;
      font-weight: 500;
    }

    .email-content {
      padding: 50px 40px;
      color: #2d3748;
    }

    .email-title {
      font-size: 28px;
      font-weight: 700;
      color: #1a202c;
      margin: 0 0 30px 0;
      line-height: 1.2;
    }

    .email-greeting {
      font-size: 18px;
      color: #4a5568;
      margin: 0 0 25px 0;
    }

    .email-body {
      font-size: 16px;
      color: #4a5568;
      margin: 0 0 25px 0;
      line-height: 1.7;
    }

    .highlight {
      color: #1e3a8a;
      font-weight: 600;
      background: linear-gradient(120deg, rgba(30, 58, 138, 0.1) 0%, rgba(30, 58, 138, 0.1) 100%);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .info-box {
      background: linear-gradient(135deg, #ebf8ff 0%, #bee3f8 100%);
      border-left: 4px solid #1e3a8a;
      padding: 20px;
      border-radius: 8px;
      margin: 25px 0;
    }

    .info-box-title {
      font-size: 16px;
      font-weight: 600;
      color: #1e3a8a;
      margin: 0 0 15px 0;
    }

    .info-detail {
      font-size: 14px;
      color: #4a5568;
      margin: 8px 0;
    }

    .info-label {
      font-weight: 600;
      color: #1e3a8a;
    }

    .success-icon {
      display: inline-block;
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
      border-radius: 50%;
      text-align: center;
      line-height: 60px;
      color: white;
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 20px;
      box-shadow: 0 4px 15px rgba(30, 58, 138, 0.3);
    }

    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%);
      margin: 40px 0;
    }

    .email-footer {
      background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
      padding: 30px 40px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }

    .footer-text {
      font-size: 14px;
      color: #718096;
      margin: 0 0 10px 0;
    }

    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 10px;
      }
      
      .email-container {
        border-radius: 12px;
      }
      
      .email-header {
        padding: 30px 20px;
      }
      
      .brand-name {
        font-size: 28px;
      }
      
      .email-content {
        padding: 40px 25px;
      }
      
      .email-title {
        font-size: 24px;
      }
      
      .email-footer {
        padding: 25px 20px;
      }
    }
  </style>
</head>

<body>
  <div class="email-wrapper">
    <table width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center">
          <table class="email-container" width="600" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td class="email-header">
                <h1 class="brand-name">INVEST UP</h1>
                <p class="brand-tagline">Your Gateway to Smart Investments</p>
              </td>
            </tr>
            <tr>
              <td class="email-content" style="text-align: center;">
                <div class="success-icon">✓</div>
                <h2 class="email-title">Email System Test Successful</h2>
                <p class="email-greeting">Hello Admin! 🎉</p>
                <p class="email-body">
                  Great news! The <span class="highlight">Invest Up</span> email delivery system is working perfectly. 
                  This test email confirms that all email communications are functioning correctly.
                </p>
                
                <div class="info-box">
                  <div class="info-box-title">⚙️ Email Configuration Details</div>
                  <div class="info-detail">
                    <span class="info-label">SMTP Host:</span> ${process.env.SMTP_HOST || 'smtp-brevo.com'}
                  </div>
                  <div class="info-detail">
                    <span class="info-label">SMTP Port:</span> ${process.env.SMTP_PORT || '587'}
                  </div>
                  <div class="info-detail">
                    <span class="info-label">Sender Email:</span> ${process.env.SENDER_EMAIL}
                  </div>
                  <div class="info-detail">
                    <span class="info-label">Test Time:</span> ${new Date().toISOString()}
                  </div>
                </div>
                
                <p class="email-body">
                  If you received this email, it means that your email delivery system is working correctly 
                  and all user communications will be delivered successfully.
                </p>
                
                <div class="divider"></div>
                
                <p class="email-body" style="font-size: 14px; color: #718096;">
                  This test was initiated from the admin dashboard to verify email functionality.
                </p>
              </td>
            </tr>
            <tr>
              <td class="email-footer">
                <p class="footer-text">© ${new Date().getFullYear()} Invest Up. All rights reserved.</p>
                <p class="footer-text">This is an automated test message from the admin dashboard.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
            `
        };
        
        try {
            // Log SMTP configuration for debugging
            console.log('SMTP configuration for test email:', {
                host: process.env.SMTP_HOST || 'smtp-brevo.com',
                port: process.env.SMTP_PORT || '587',
                user: process.env.SMTP_USER,
                sender: process.env.SENDER_EMAIL,
                recipient: testEmail
            });
            
            // Send test email
            const info = await transporter.sendMail(mailOptions);
            console.log('Test email sent successfully:', info.messageId);
            
            res.json({ 
                success: true, 
                message: 'Test email sent successfully', 
                details: {
                    messageId: info.messageId,
                    recipient: testEmail,
                    time: new Date().toISOString()
                }
            });
        } catch (emailError) {
            console.error('Failed to send test email:', emailError);
            const errorInfo = {
                message: emailError.message,
                stack: emailError.stack,
                code: emailError.code
            };
            console.error('Email error details:', errorInfo);
            
            res.status(500).json({ 
                success: false, 
                message: 'Failed to send test email: ' + emailError.message,
                error: errorInfo
            });
        }
    } catch (error) {
        console.error('Error in test email function:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send test email', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export const broadcastMessage = async (req, res) => {
    try {
        const { subject, message } = req.body;
        
        console.log('Broadcast request received:', { subject, messageLength: message?.length });
        
        if (!subject || !message) {
            console.log('Broadcast validation failed: missing subject or message');
            return res.status(400).json({ success: false, message: 'Subject and message are required.' });
        }

        // Fetch all user emails
        console.log('Fetching all user emails...');
        const users = await User.findAll({ attributes: ['email'] });
        const emails = users.map(user => user.email).filter(Boolean);
        
        console.log(`Found ${users.length} users, ${emails.length} valid emails`);
        
        if (emails.length === 0) {
            console.log('No valid emails found for broadcast');
            return res.status(400).json({ success: false, message: 'No users to send broadcast to.' });
        }

        // Validate email configuration
        if (!process.env.SENDER_EMAIL) {
            console.error('SENDER_EMAIL environment variable not set');
            return res.status(500).json({ 
                success: false, 
                message: 'Email configuration error: SENDER_EMAIL not configured.' 
            });
        }

        // Compose mail options
        const mailOptions = {
            from: {
                name: process.env.SENDER_NAME || 'Invest Up Support',
                address: process.env.SENDER_EMAIL
            },
            bcc: emails, // Use BCC to protect user privacy
            subject,
            text: message,
            html: `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Invest Up - ${subject}</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" type="text/css">
  <style type="text/css">
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
      color: #1a202c;
      line-height: 1.6;
    }

    table, td {
      border-collapse: collapse;
    }

    .email-wrapper {
      width: 100%;
      min-height: 100vh;
      padding: 20px 0;
    }

    .email-container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .email-header {
      background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
      padding: 40px 30px;
      text-align: center;
      position: relative;
    }

    .brand-name {
      color: #ffffff;
      margin: 0;
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.5px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .brand-tagline {
      color: rgba(255, 255, 255, 0.9);
      margin: 8px 0 0 0;
      font-size: 16px;
      font-weight: 500;
    }

    .email-content {
      padding: 50px 40px;
      color: #2d3748;
    }

    .email-title {
      font-size: 28px;
      font-weight: 700;
      color: #1a202c;
      margin: 0 0 30px 0;
      line-height: 1.2;
    }

    .email-greeting {
      font-size: 18px;
      color: #4a5568;
      margin: 0 0 25px 0;
    }

    .email-body {
      font-size: 16px;
      color: #4a5568;
      margin: 0 0 25px 0;
      line-height: 1.7;
    }

    .highlight {
      color: #1e3a8a;
      font-weight: 600;
      background: linear-gradient(120deg, rgba(30, 58, 138, 0.1) 0%, rgba(30, 58, 138, 0.1) 100%);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .message-box {
      background: linear-gradient(135deg, #ebf8ff 0%, #bee3f8 100%);
      border-left: 4px solid #1e3a8a;
      padding: 20px;
      border-radius: 8px;
      margin: 25px 0;
    }

    .message-title {
      font-size: 16px;
      font-weight: 600;
      color: #1e3a8a;
      margin: 0 0 10px 0;
    }

    .message-content {
      font-size: 14px;
      color: #4a5568;
      margin: 0;
      line-height: 1.6;
    }

    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%);
      margin: 40px 0;
    }

    .email-footer {
      background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
      padding: 30px 40px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }

    .footer-text {
      font-size: 14px;
      color: #718096;
      margin: 0 0 10px 0;
    }

    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 10px;
      }
      
      .email-container {
        border-radius: 12px;
      }
      
      .email-header {
        padding: 30px 20px;
      }
      
      .brand-name {
        font-size: 28px;
      }
      
      .email-content {
        padding: 40px 25px;
      }
      
      .email-title {
        font-size: 24px;
      }
      
      .email-footer {
        padding: 25px 20px;
      }
    }
  </style>
</head>

<body>
  <div class="email-wrapper">
    <table width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center">
          <table class="email-container" width="600" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td class="email-header">
                <div class="brand-logo">
                  <h1 class="brand-name">INVEST UP</h1>
                  <p class="brand-tagline">Your Gateway to Smart Investments</p>
                </div>
              </td>
            </tr>
            <tr>
              <td class="email-content">
                <h2 class="email-title">${subject}</h2>
                <p class="email-greeting">Hello there! 📢</p>
                
                <div class="message-box">
                  <div class="message-title">📋 Important Message</div>
                  <div class="message-content">${message.replace(/\n/g, '<br>')}</div>
                </div>
                
                <p class="email-body">
                  Thank you for being a valued member of the <span class="highlight">Invest Up</span> community. 
                  We appreciate your continued trust in our platform.
                </p>
                
                <div class="divider"></div>
                
                <p class="email-body" style="font-size: 14px; color: #718096;">
                  This is an automated message from Invest Up. Please do not reply to this email.
                </p>
              </td>
            </tr>
            <tr>
              <td class="email-footer">
                <p class="footer-text">© ${new Date().getFullYear()} Invest Up. All rights reserved.</p>
                <p class="footer-text">This is an automated message, please do not reply to this email.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
            `
        };

        console.log('Attempting to send broadcast email...');
        const info = await transporter.sendMail(mailOptions);
        
        console.log('Broadcast email sent successfully:', {
            messageId: info.messageId,
            recipientCount: emails.length
        });
        
        res.json({ 
            success: true, 
            message: `Broadcast message sent to ${emails.length} users.`, 
            info: {
                messageId: info.messageId,
                recipientCount: emails.length
            }
        });
    } catch (error) {
        console.error('Broadcast error:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        
        // Provide more specific error messages
        let errorMessage = 'Failed to send broadcast.';
        if (error.code === 'EAUTH') {
            errorMessage = 'Email authentication failed. Please check SMTP credentials.';
        } else if (error.code === 'ECONNECTION') {
            errorMessage = 'Email connection failed. Please check SMTP settings.';
        } else if (error.message) {
            errorMessage = `Failed to send broadcast: ${error.message}`;
        }
        
        res.status(500).json({ 
            success: false, 
            message: errorMessage, 
            error: error.message 
        });
    }
}; 