import Withdrawal from '../models/Withdrawal.js';
import User from '../models/userModel.js';
import { getSetting } from './settingsController.js';

// We'll replace this with dynamic fetching from settings
// const VALID_WITHDRAWAL_METHODS = ['BINANCE', 'TRC20', 'BEP20', 'ERC20', 'OPTIMISM'];

export const requestWithdrawal = async (req, res) => {
    try {
        const { amount, paymentMethod, walletAddress } = req.body;
        const userId = req.userId;
        
        // Get valid withdrawal methods from settings
        let validWithdrawalMethods = [];
        try {
            const depositAddresses = await getSetting('depositAddresses');
            if (depositAddresses && typeof depositAddresses === 'object') {
                validWithdrawalMethods = Object.keys(depositAddresses);
            }
        } catch (settingError) {
            console.error('Error fetching valid withdrawal methods:', settingError);
            // Fallback to common methods if we can't get from settings
            validWithdrawalMethods = ['BINANCE', 'TRC20', 'BEP20', 'ERC20', 'OPTIMISM'];
        }
        
        // Validate payment method
        if (!validWithdrawalMethods.includes(paymentMethod)) {
            return res.json({ 
                success: false, 
                message: `Invalid withdrawal method. Valid methods are: ${validWithdrawalMethods.join(', ')}` 
            });
        }
        
        // Get withdrawal fee and minimum withdrawal amount from settings
        const withdrawalFee = await getSetting('withdrawalFee');
        const minWithdrawal = await getSetting('minWithdrawal');
        const minInvestment = await getSetting('minInvestment');
        
        const user = await User.findByPk(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        if (parseFloat(amount) < minWithdrawal) {
            return res.json({ success: false, message: `Minimum withdrawal amount is $${minWithdrawal}` });
        }

        const totalAmount = parseFloat(amount) + withdrawalFee;
        
        if (totalAmount > parseFloat(user.balance)) {
            return res.json({ success: false, message: `Insufficient balance (includes $${withdrawalFee} withdrawal fee)` });
        }

        // Deduct the amount immediately
        await user.decrement('balance', { by: totalAmount });
        await user.reload();

        const withdrawal = await Withdrawal.create({
            userId,
            amount: parseFloat(amount),
            paymentMethod,
            walletAddress,
            status: 'pending'
        });

        res.json({ 
            success: true, 
            message: `Withdrawal request submitted successfully. Note: A $${withdrawalFee} processing fee will be charged upon approval.`,
            withdrawal: {
                ...withdrawal.toJSON(),
                transactionId: withdrawal.transactionId,
                fee: withdrawalFee,
                totalDeduction: totalAmount
            }
        });

    } catch (error) {
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
                },
                paymentDetails: {
                    method: withdrawal.paymentMethod,
                    address: withdrawal.walletAddress
                }
            }))
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getWithdrawalHistory = async (req, res) => {
    try {
        const withdrawals = await Withdrawal.findAll({
            where: { userId: req.userId },
            order: [['createdAt', 'DESC']]
        });

        res.json({ 
            success: true, 
            withdrawals
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const editWithdrawal = async (req, res) => {
    try {
        const { withdrawalId, amount, paymentMethod, walletAddress } = req.body;
        const userId = req.userId;
        
        // Find the withdrawal
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
        
        // Check if withdrawal is pending
        if (withdrawal.status !== 'pending') {
            return res.json({ 
                success: false, 
                message: 'Only pending withdrawals can be edited' 
            });
        }
        
        // Get valid withdrawal methods from settings
        let validWithdrawalMethods = [];
        try {
            const depositAddresses = await getSetting('depositAddresses');
            if (depositAddresses && typeof depositAddresses === 'object') {
                validWithdrawalMethods = Object.keys(depositAddresses);
            }
        } catch (settingError) {
            console.error('Error fetching valid withdrawal methods:', settingError);
            // Fallback to common methods if we can't get from settings
            validWithdrawalMethods = ['BINANCE', 'TRC20', 'BEP20', 'ERC20', 'OPTIMISM'];
        }
        
        // Validate payment method
        if (paymentMethod && !validWithdrawalMethods.includes(paymentMethod)) {
            return res.json({ 
                success: false, 
                message: `Invalid withdrawal method. Valid methods are: ${validWithdrawalMethods.join(', ')}` 
            });
        }
        
        // Get withdrawal fee and minimum withdrawal amount from settings
        const withdrawalFee = await getSetting('withdrawalFee');
        const minWithdrawal = await getSetting('minWithdrawal');
        
        // Validate amount if provided
        if (amount) {
            if (parseFloat(amount) < minWithdrawal) {
                return res.json({ success: false, message: `Minimum withdrawal amount is $${minWithdrawal}` });
            }
            
            const user = await User.findByPk(userId);
            if (!user) {
                return res.json({ success: false, message: 'User not found' });
            }
            
            const newTotalAmount = parseFloat(amount) + withdrawalFee;
            const oldTotalAmount = parseFloat(withdrawal.amount) + withdrawalFee;
            
            // Check if user has enough balance for the new amount
            if (newTotalAmount > parseFloat(user.balance) + oldTotalAmount) {
                return res.json({ success: false, message: `Insufficient balance (includes $${withdrawalFee} withdrawal fee)` });
            }
            
            // If amount is changing, adjust the user's balance accordingly
            if (parseFloat(amount) !== parseFloat(withdrawal.amount)) {
                // Refund the old amount (including fee)
                await user.increment('balance', { by: oldTotalAmount });
                
                // Deduct the new amount (including fee)
                await user.decrement('balance', { by: newTotalAmount });
                await user.reload();
            }
        }
        
        // Update fields
        const updateData = {};
        if (amount) updateData.amount = amount;
        if (paymentMethod) updateData.paymentMethod = paymentMethod;
        if (walletAddress) updateData.walletAddress = walletAddress;
        
        // Update the withdrawal
        await withdrawal.update(updateData);
        
        res.json({ 
            success: true, 
            message: 'Withdrawal request updated successfully',
            withdrawal: {
                ...withdrawal.toJSON(),
                transactionId: withdrawal.transactionId,
                fee: withdrawalFee
            }
        });
        
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const deleteWithdrawal = async (req, res) => {
    try {
        const { withdrawalId } = req.params;
        const userId = req.userId;
        
        // Find the withdrawal
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
        
        // Get withdrawal fee from settings
        const withdrawalFee = await getSetting('withdrawalFee');
        
        // Handle different statuses
        const user = await User.findByPk(userId);
        
        if (withdrawal.status === 'pending') {
            // For pending withdrawals, refund the amount and the fee
            if (user) {
                const totalAmount = parseFloat(withdrawal.amount) + withdrawalFee;
                await user.increment('balance', { by: totalAmount });
            }
            
            // Delete the withdrawal since it was pending
            await withdrawal.destroy();
            
            return res.json({ 
                success: true, 
                message: 'Withdrawal deleted successfully and amount refunded to your balance'
            });
        } else if (withdrawal.status === 'approved') {
            // Approved withdrawals cannot be deleted, only hidden
            return res.json({
                success: false,
                message: 'Approved withdrawals cannot be deleted. Please use the hide option instead.'
            });
        } else {
            return res.json({ 
                success: false, 
                message: 'Only pending withdrawals can be deleted' 
            });
        }
        
    } catch (error) {
        console.error('Error deleting withdrawal:', error);
        res.json({ success: false, message: error.message });
    }
};

export const toggleWithdrawalHidden = async (req, res) => {
    try {
        const { withdrawalId } = req.params;
        const userId = req.userId;
        
        // Find the withdrawal
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
        
        // Only approved withdrawals can be hidden/unhidden
        if (withdrawal.status !== 'approved') {
            return res.json({ 
                success: false, 
                message: 'Only approved withdrawals can be hidden or unhidden' 
            });
        }
        
        // Toggle the hidden status
        const newHiddenStatus = !withdrawal.hidden;
        await withdrawal.update({ hidden: newHiddenStatus });
        
        return res.json({ 
            success: true, 
            message: newHiddenStatus 
                ? 'Withdrawal hidden successfully' 
                : 'Withdrawal unhidden successfully',
            hidden: newHiddenStatus
        });
        
    } catch (error) {
        console.error('Error toggling withdrawal hidden status:', error);
        res.json({ success: false, message: error.message });
    }
}; 