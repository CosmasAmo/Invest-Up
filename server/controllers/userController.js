import User from '../models/userModel.js';
import Deposit from '../models/Deposit.js';
import Investment from '../models/Investment.js';
import Withdrawal from '../models/Withdrawal.js';
import Contact from "../models/Contact.js"; // Used for messages and contacts
import DeletedDeposit from '../models/deletedDepositModel.js';
import DeletedInvestment from '../models/deletedInvestmentModel.js';
import { Op } from "sequelize";
import validateEmail from '../utils/emailValidator.js';

export const getUserdata = async (req, res) => {
    try {
        const userId = req.userId;
        
        console.log(`Fetching fresh user data for ID: ${userId}`);
        
        // Use { raw: false } to ensure we get a Sequelize instance and not just raw data
        const user = await User.findByPk(userId, { raw: false });
        
        if(!user) {
            console.error(`User not found with ID: ${userId}`);
            return res.json({success: false, message: 'User not found'});
        }
        
        // Force a reload to get the latest data from the database
        await user.reload();
        console.log(`Reloaded user data for ${userId}`);
        console.log(`Current referral data - Count: ${user.referralCount}, Successful: ${user.successfulReferrals}, Earnings: ${user.referralEarnings}`);

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
            try {
                const referrer = await User.findByPk(user.referredBy);
                if (referrer) {
                    referrerName = referrer.name;
                    console.log(`Found referrer name: ${referrerName}`);
                }
            } catch (referrerError) {
                console.error('Error fetching referrer:', referrerError);
                // Continue even if referrer fetch fails
            }
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

        // Ensure referral code is included in response
        const userReferralCode = user.referralCode || '';
        console.log('User referral code:', userReferralCode);
        console.log('Full user object:', JSON.stringify(user, null, 2));

        // Format the user data
        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            isAccountVerified: user.isAccountVerified,
            referralCode: userReferralCode,
            referralCount: user.referralCount || 0,
            successfulReferrals: user.successfulReferrals || 0,
            referralEarnings: parseFloat(user.referralEarnings || 0).toFixed(2),
            balance: parseFloat(user.balance || 0).toFixed(2),
            profileImage: validatedProfileImage,
            profilePicture: validatedProfilePicture,
            recentTransactions: deposits.slice(0, 5), // Get last 5 transactions
            referredBy: user.referredBy,
            referredByName: referrerName,
            createdAt: user.createdAt
        };

        return res.json({
            success: true,
            userData: userData,
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

        console.log('Update profile request:', { name, email, file: req.file ? req.file.filename : 'none' });

        // Check if required fields are provided
        if (!email) {
            return res.json({ success: false, message: 'Email address is required' });
        }

        if (!name) {
            return res.json({ success: false, message: 'Name is required' });
        }

        const user = await User.findByPk(userId);

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // If email is being changed, validate it
        if (email !== user.email) {
            // Validate email format and existence
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

        // Prepare update data - only name and email
        const updateData = { name, email };
        
        // Add profile image if uploaded
        if (req.file) {
            console.log('Processing profile image:', req.file.filename);
            const profileImage = `/uploads/${req.file.filename}`;
            updateData.profileImage = profileImage;
            updateData.profilePicture = profileImage; // Update both fields for consistency
        }
        
        // Update the user's profile
        await user.update(updateData);

        // Get the updated user data to ensure we have the latest values
        const updatedUser = await User.findByPk(userId, {
            attributes: { exclude: ['password', 'resetOtp', 'verifyOtp'] } // Exclude sensitive data
        });

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
        
        // Format user data
        const userData = updatedUser.toJSON();

        // Return success response with updated user data
        console.log('Profile update successful:', {
            name: userData.name,
            email: userData.email
        });
        
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
        console.log(`Fetching dashboard data for user: ${userId}`);
        
        // Get user data with a forced reload
        const user = await User.findByPk(userId, { raw: false });
        if (!user) {
            console.error(`User not found with ID: ${userId}`);
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Force a reload to get the latest data
        await user.reload();
        console.log(`Reloaded user data for dashboard - Referrals: ${user.referralCount}, Successful: ${user.successfulReferrals}, Earnings: ${user.referralEarnings}`);
        
        // Ensure both profile image fields are properly set
        const userData = user.toJSON();
        if (userData.profileImage && !userData.profilePicture) {
            userData.profilePicture = userData.profileImage;
        } else if (userData.profilePicture && !userData.profileImage) {
            userData.profileImage = userData.profilePicture;
        }
        
        // Get investments data
        console.log('Fetching investments...');
        const investments = await Investment.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });
        console.log(`Found ${investments.length} investments`);

        // Get deleted investments
        console.log('Fetching deleted investments...');
        const deletedInvestments = await DeletedInvestment.findAll({
            where: { userId }
        });
        console.log(`Found ${deletedInvestments.length} deleted investments`);

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

        // We're no longer adding deleted investments to the total
        // as we only want to show active investments
        
        // Get deposits data
        console.log('Fetching deposits...');
        const deposits = await Deposit.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });
        console.log(`Found ${deposits.length} deposits`);

        // Get deleted deposits to include in total calculation
        const deletedDeposits = await DeletedDeposit.findAll({
            where: { userId }
        });
        console.log(`Found ${deletedDeposits.length} deleted deposits`);

        // Calculate total from approved deposits and deleted deposits
        const totalDeposits = deposits.reduce((acc, dep) => {
            if (dep.status === 'approved') {
                return acc + parseFloat(dep.amount);
            }
            return acc;
        }, 0) + deletedDeposits.reduce((acc, dep) => acc + parseFloat(dep.amount), 0);
        
        // Get withdrawals data
        console.log('Fetching withdrawals...');
        const withdrawals = await Withdrawal.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });
        console.log(`Found ${withdrawals.length} withdrawals`);
        
        // Calculate withdrawal statistics - only include approved, not deleted
        const totalWithdrawals = withdrawals
            .filter(w => w.status === 'approved')
            .reduce((sum, w) => sum + Number(w.amount), 0);
        const pendingWithdrawals = withdrawals
            .filter(w => w.status === 'pending')
            .length;
        const completedWithdrawals = withdrawals
            .filter(w => w.status === 'approved')
            .length;
        // Only approved withdrawals count

        // Combine deposits and investments into recent transactions
        console.log('Combining transactions for dashboard display...');
        const allTransactions = [
            ...deposits.map(dep => ({
                id: dep.id,
                type: 'deposit',
                amount: dep.amount,
                status: dep.status,
                paymentMethod: dep.paymentMethod,
                proofImage: dep.proofImage,
                createdAt: dep.createdAt,
                updatedAt: dep.updatedAt
            })),
            ...investments.map(inv => ({
                id: inv.id,
                type: 'investment',
                amount: inv.amount,
                status: inv.status,
                paymentMethod: 'Balance',
                proofImage: null,
                createdAt: inv.createdAt,
                updatedAt: inv.updatedAt,
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
                createdAt: withdrawal.createdAt,
                updatedAt: withdrawal.updatedAt
            }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        console.log(`Combined ${allTransactions.length} total transactions`);

        // Count pending deposits
        const pendingDeposits = deposits.filter(dep => dep.status === 'pending').length;

        // Make sure we have recent transactions to return
        const recentTransactions = allTransactions.slice(0, 10); // Get last 10 transactions
        console.log(`Returning ${recentTransactions.length} recent transactions`);

        // Return with consistent user data
        console.log('Sending dashboard data response');
        res.json({
            success: true,
            user: {
                ...userData,
                successfulReferrals: userData.successfulReferrals || 0,
                referralCount: userData.referralCount || 0,
                recentTransactions, // Ensure this is included
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
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
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

        // Get deleted deposits to calculate total amount
        const deletedDeposits = await DeletedDeposit.findAll({
            where: { userId }
        });

        // Calculate total from approved deposits and deleted deposits
        const totalDepositsAmount = deposits.reduce((acc, dep) => {
            if (dep.status === 'approved') {
                return acc + parseFloat(dep.amount);
            }
            return acc;
        }, 0) + deletedDeposits.reduce((acc, dep) => acc + parseFloat(dep.amount), 0);

        res.json({
            success: true,
            deposits,
            totalDepositsAmount
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getUserTransactions = async (req, res) => {
    try {
        const userId = req.userId;
        const limit = req.query.limit ? parseInt(req.query.limit) : null; // Get limit from query params
        
        console.log(`Fetching transactions for user: ${userId}, limit: ${limit || 'none'}`);
        console.log('Authorization header:', req.headers.authorization?.substring(0, 20) + '...');

        // Get user data for including in response
        const user = await User.findByPk(userId);
        if (!user) {
            console.error(`User not found with ID: ${userId}`);
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        console.log(`User found: ${user.name}, ${user.email}`);
        
        // Get deposits data
        console.log('Fetching deposits...');
        const deposits = await Deposit.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });
        console.log(`Found ${deposits.length} deposits`);

        // Get investments data
        console.log('Fetching investments...');
        const investments = await Investment.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });
        console.log(`Found ${investments.length} investments`);

        // Get deleted investments
        console.log('Fetching deleted investments...');
        const deletedInvestments = await DeletedInvestment.findAll({
            where: { userId }
        });
        console.log(`Found ${deletedInvestments.length} deleted investments`);

        // Get withdrawals data
        console.log('Fetching withdrawals...');
        const withdrawals = await Withdrawal.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });
        console.log(`Found ${withdrawals.length} withdrawals`);

        // Combine all transactions, but exclude ones with 'deleted' status for display
        console.log('Combining transactions...');
        let allTransactions = [
            ...deposits.map(dep => ({
                id: dep.id,
                type: 'deposit',
                amount: dep.amount,
                status: dep.status,
                paymentMethod: dep.paymentMethod,
                proofImage: dep.proofImage,
                createdAt: dep.createdAt,
                updatedAt: dep.updatedAt
            })),
            ...investments
                .filter(inv => inv.status !== 'deleted')
                .map(inv => ({
                    id: inv.id,
                    type: 'investment',
                    amount: inv.amount,
                    status: inv.status,
                    paymentMethod: 'Balance',
                    proofImage: null,
                    createdAt: inv.createdAt,
                    updatedAt: inv.updatedAt,
                    dailyProfitRate: inv.dailyProfitRate,
                    totalProfit: inv.totalProfit || 0
                })),
            ...withdrawals
                .filter(w => w.status !== 'deleted')
                .map(withdrawal => ({
                    id: withdrawal.id,
                    type: 'withdrawal',
                    amount: withdrawal.amount,
                    status: withdrawal.status,
                    paymentMethod: withdrawal.paymentMethod,
                    walletAddress: withdrawal.walletAddress,
                    createdAt: withdrawal.createdAt,
                    updatedAt: withdrawal.updatedAt
                }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by date, newest first
        
        console.log(`Combined ${allTransactions.length} total transactions`);
        
        if (allTransactions.length === 0) {
            console.log('No transactions found for user. This might be the issue.');
        } else {
            console.log('First transaction:', JSON.stringify(allTransactions[0]));
        }

        // Apply limit if specified
        if (limit && !isNaN(limit) && limit > 0) {
            console.log(`Applying limit of ${limit} transactions`);
            allTransactions = allTransactions.slice(0, limit);
        }

        // Calculate totals - include approved items and deleted investments for stats
        const totalDeposits = deposits
            .filter(dep => dep.status === 'approved')
            .reduce((sum, dep) => sum + parseFloat(dep.amount), 0);
            
        const totalWithdrawals = withdrawals
            .filter(w => w.status === 'approved')
            .reduce((sum, w) => sum + parseFloat(w.amount), 0);
            
        // Calculate total investments including deleted ones
        const activeInvestments = investments
            .filter(inv => inv.status === 'approved')
            .reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
            
        const deletedInvestmentsTotal = deletedInvestments
            .reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
            
        const totalInvestments = activeInvestments + deletedInvestmentsTotal;

        // Format user data to ensure consistent profile image fields
        const userData = user ? user.toJSON() : {};
        if (userData.profileImage && !userData.profilePicture) {
            userData.profilePicture = userData.profileImage;
        } else if (userData.profilePicture && !userData.profileImage) {
            userData.profileImage = userData.profilePicture;
        }
        
        console.log('Sending transactions response with data');
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
        console.error('Error fetching user transactions:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            success: false, 
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
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

export const getUserStats = async (req, res) => {
    try {
        const userId = req.userId;
        
        // Get user data
        const user = await User.findByPk(userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Get investments data
        const investments = await Investment.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });

        // Get deleted investments
        const deletedInvestments = await DeletedInvestment.findAll({
            where: { userId }
        });

        // Calculate investment statistics - only count approved investments for active count
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

        // Get deleted deposits to include in total calculation
        const deletedDeposits = await DeletedDeposit.findAll({
            where: { userId }
        });

        // Calculate total from approved deposits and deleted deposits
        const totalDeposits = deposits.reduce((acc, dep) => {
            if (dep.status === 'approved') {
                return acc + parseFloat(dep.amount);
            }
            return acc;
        }, 0) + deletedDeposits.reduce((acc, dep) => acc + parseFloat(dep.amount), 0);

        // Get withdrawals
        const withdrawals = await Withdrawal.findAll({
            where: { userId }
        });
        
        // Calculate withdrawal totals - only include approved withdrawals, not deleted ones
        const totalWithdrawals = withdrawals
            .filter(w => w.status === 'approved')
            .reduce((sum, w) => sum + Number(w.amount), 0);
            
        // Only pending withdrawals count towards pendingWithdrawals
        const pendingWithdrawals = withdrawals
            .filter(w => w.status === 'pending')
            .reduce((sum, w) => sum + Number(w.amount), 0);
            
        // Only approved withdrawals count as completed
        const completedWithdrawals = withdrawals
            .filter(w => w.status === 'approved')
            .reduce((sum, w) => sum + Number(w.amount), 0);

        // Count pending deposits
        const pendingDeposits = deposits.filter(dep => dep.status === 'pending').length;

        // Return stats object
        res.json({
            success: true,
            stats: {
                balance: parseFloat(user.balance || 0),
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
        console.error('Error getting user stats:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
