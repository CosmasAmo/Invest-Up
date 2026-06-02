import path from 'path';
import fs from 'fs';
import Deposit from '../models/Deposit.js';
import DeletedDeposit from '../models/deletedDepositModel.js';
import Withdrawal from '../models/Withdrawal.js';
import DeletedWithdrawal from '../models/deletedWithdrawalModel.js';
import { fileURLToPath } from 'url';
import { getSetting } from '../controllers/settingsController.js';
import User from '../models/userModel.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// We'll replace this with dynamic fetching from settings
// const VALID_DEPOSIT_METHODS = ['BINANCE', 'TRC20', 'BEP20', 'ERC20', 'OPTIMISM'];

export const createDeposit = async (req, res) => {
    try {
        const { amount, paymentMethod } = req.body;
        const userId = req.userId;
        
        // Validate payment method exists
        if (!paymentMethod) {
            return res.json({ 
                success: false, 
                message: 'Payment method is required' 
            });
        }
        
        if (!req.file) {
            return res.json({ 
                success: false, 
                message: 'Proof of payment is required' 
            });
        }

        // Fetch valid deposit methods from settings
        let validDepositMethods = [];
        try {
            const depositAddresses = await getSetting('depositAddresses');
            if (depositAddresses && typeof depositAddresses === 'object') {
                validDepositMethods = Object.keys(depositAddresses);
            }
        } catch (settingError) {
            console.error('Error fetching valid deposit methods:', settingError);
            // Fallback to common methods if we can't get from settings
            validDepositMethods = ['BINANCE', 'TRC20', 'BEP20', 'ERC20', 'OPTIMISM'];
        }

        // Validate payment method
        if (!validDepositMethods.includes(paymentMethod)) {
            return res.json({ 
                success: false, 
                message: `Invalid payment method. Valid methods are: ${validDepositMethods.join(', ')}` 
            });
        }
        
        const user = await User.findOne({ where: { id: userId } });
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        const deposit = await Deposit.create({
            userId,
            amount,
            paymentMethod,
            proofImage: req.file.filename,
            status: 'pending'
        });

        res.json({ 
            success: true, 
            message: 'Deposit request submitted successfully',
            deposit: {
                ...deposit.toJSON(),
                transactionId: deposit.transactionId
            }
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const editDeposit = async (req, res) => {
    try {
        const { depositId, amount, paymentMethod } = req.body;
        const userId = req.userId;
        
        // Find the deposit
        const deposit = await Deposit.findOne({
            where: {
                id: depositId,
                userId
            }
        });
        
        if (!deposit) {
            return res.json({ 
                success: false, 
                message: 'Deposit not found' 
            });
        }
        
        // Check if deposit is pending
        if (deposit.status !== 'pending') {
            return res.json({ 
                success: false, 
                message: 'Only pending deposits can be edited' 
            });
        }
        
        // Get valid deposit methods from settings
        let validDepositMethods = [];
        try {
            const depositAddresses = await getSetting('depositAddresses');
            if (depositAddresses && typeof depositAddresses === 'object') {
                validDepositMethods = Object.keys(depositAddresses);
            }
        } catch (settingError) {
            console.error('Error fetching valid deposit methods:', settingError);
            // Fallback to common methods if we can't get from settings
            validDepositMethods = ['BINANCE', 'TRC20', 'BEP20', 'ERC20', 'OPTIMISM'];
        }
        
        // Validate payment method - only if a payment method is provided
        if (paymentMethod && !validDepositMethods.includes(paymentMethod)) {
            return res.json({ 
                success: false, 
                message: `Invalid payment method. Valid methods are: ${validDepositMethods.join(', ')}` 
            });
        }
        
        // Update fields
        const updateData = {};
        if (amount) updateData.amount = amount;
        if (paymentMethod) updateData.paymentMethod = paymentMethod;
        
        // Handle file upload if provided
        if (req.file) {
            // Delete old proof image if it exists
            if (deposit.proofImage) {
                const oldImagePath = path.join(__dirname, '../uploads', deposit.proofImage);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            
            updateData.proofImage = req.file.filename;
        }
        
        // Update the deposit
        await deposit.update(updateData);
        
        res.json({ 
            success: true, 
            message: 'Deposit updated successfully',
            deposit: {
                ...deposit.toJSON(),
                transactionId: deposit.transactionId
            }
        });
        
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const deleteDeposit = async (req, res) => {
    try {
        const { depositId } = req.params;
        const userId = req.userId;
        
        // Find the deposit
        const deposit = await Deposit.findOne({
            where: {
                id: depositId,
                userId
            }
        });
        
        if (!deposit) {
            return res.json({ 
                success: false, 
                message: 'Deposit not found' 
            });
        }
        
        // Check if deposit status is approved
        if (deposit.status === 'approved') {
            return res.json({
                success: false,
                message: 'Approved deposits cannot be deleted. Please use the hide option instead.'
            });
        }
        
        // Handle different statuses
        if (deposit.status !== 'pending') {
            return res.json({ 
                success: false, 
                message: 'Only pending deposits can be deleted' 
            });
        }
        
        // Delete proof image if it exists
        if (deposit.proofImage) {
            const imagePath = path.join(__dirname, '../uploads', deposit.proofImage);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        
        // Delete the deposit
        await deposit.destroy();
        
        res.json({ 
            success: true, 
            message: 'Deposit deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting deposit:', error);
        res.json({ success: false, message: error.message });
    }
};

export const deleteWithdrawal = async (req, res) => {
    try {
        const { withdrawalId } = req.params;
        const userId = req.userId;

        const withdrawal = await Withdrawal.findOne({
            where: {
                id: withdrawalId,
                userId
            }
        });

        if (!withdrawal) {
            return res.json({
                success: false,
                message: 'Withdrawal not found'
            });
        }

        // Delete the proof image if it exists
        if (withdrawal.proofImage) {
            const imagePath = path.join(__dirname, '..', 'uploads', 'withdrawals', withdrawal.proofImage);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        // Store the withdrawal in DeletedWithdrawal before deleting
        await DeletedWithdrawal.create({
            userId: withdrawal.userId,
            originalWithdrawalId: withdrawal.id,
            amount: withdrawal.amount,
            status: withdrawal.status,
            originalCreatedAt: withdrawal.createdAt
        });

        // Delete the withdrawal
        await withdrawal.destroy();

        res.json({
            success: true,
            message: 'Withdrawal deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting withdrawal:', error);
        res.json({ success: false, message: error.message });
    }
};

export const getTotalWithdrawals = async (req, res) => {
    try {
        const userId = req.userId;

        // Get total from active withdrawals
        const activeWithdrawals = await Withdrawal.sum('amount', {
            where: { 
                userId,
                status: 'approved'
            }
        });

        // Get total from deleted withdrawals
        const deletedWithdrawals = await DeletedWithdrawal.sum('amount', {
            where: { 
                userId,
                status: 'approved'
            }
        });

        const totalWithdrawals = (activeWithdrawals || 0) + (deletedWithdrawals || 0);

        res.json({
            success: true,
            totalWithdrawals
        });
    } catch (error) {
        console.error('Error getting total withdrawals:', error);
        res.json({ success: false, message: error.message });
    }
};

export const createWithdrawal = async (req, res) => {
    try {
        const { amount, paymentMethod, accountDetails } = req.body;
        const userId = req.userId;

        // Validate required fields
        if (!amount || !paymentMethod || !accountDetails) {
            return res.json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if user exists
        const user = await User.findByPk(userId);
        if (!user) {
            return res.json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user has sufficient balance
        if (parseFloat(user.balance) < parseFloat(amount)) {
            return res.json({
                success: false,
                message: 'Insufficient balance'
            });
        }

        // Create withdrawal
        const withdrawal = await Withdrawal.create({
            userId,
            amount,
            paymentMethod,
            accountDetails,
            status: 'pending'
        });

        // Deduct amount from user's balance
        await user.decrement('balance', { by: parseFloat(amount) });

        res.json({
            success: true,
            message: 'Withdrawal request created successfully',
            withdrawal
        });
    } catch (error) {
        console.error('Error creating withdrawal:', error);
        res.json({ success: false, message: error.message });
    }
};

export const getWithdrawals = async (req, res) => {
    try {
        const userId = req.userId;

        const withdrawals = await Withdrawal.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            withdrawals
        });
    } catch (error) {
        console.error('Error getting withdrawals:', error);
        res.json({ success: false, message: error.message });
    }
};

export const toggleDepositHidden = async (req, res) => {
    try {
        const { depositId } = req.params;
        const userId = req.userId;
        
        // Find the deposit
        const deposit = await Deposit.findOne({
            where: {
                id: depositId,
                userId
            }
        });
        
        if (!deposit) {
            return res.json({ 
                success: false, 
                message: 'Deposit not found' 
            });
        }
        
        // Only approved deposits can be hidden/unhidden
        if (deposit.status !== 'approved') {
            return res.json({ 
                success: false, 
                message: 'Only approved deposits can be hidden or unhidden' 
            });
        }
        
        // Toggle the hidden status
        const newHiddenStatus = !deposit.hidden;
        await deposit.update({ hidden: newHiddenStatus });
        
        return res.json({ 
            success: true, 
            message: newHiddenStatus 
                ? 'Deposit hidden successfully' 
                : 'Deposit unhidden successfully',
            hidden: newHiddenStatus
        });
        
    } catch (error) {
        console.error('Error toggling deposit hidden status:', error);
        res.json({ success: false, message: error.message });
    }
}; 