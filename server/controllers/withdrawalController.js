import Withdrawal from '../models/Withdrawal.js';
import User from '../models/userModel.js';

export const requestWithdrawal = async (req, res) => {
    try {
        const { amount, paymentMethod, walletAddress } = req.body;
        const userId = req.userId;
        
        const user = await User.findByPk(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        if (parseFloat(amount) < 10) {
            return res.json({ success: false, message: 'Minimum withdrawal amount is $10' });
        }

        if (parseFloat(amount) > parseFloat(user.balance)) {
            return res.json({ success: false, message: 'Insufficient balance' });
        }

        const withdrawal = await Withdrawal.create({
            userId,
            amount,
            paymentMethod,
            walletAddress,
            status: 'pending'
        });

        // Deduct the amount from user's balance
        await user.decrement('balance', { by: parseFloat(amount) });
        await user.reload();

        res.json({ 
            success: true, 
            message: 'Withdrawal request submitted successfully',
            withdrawal: {
                ...withdrawal.toJSON(),
                transactionId: withdrawal.transactionId
            }
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const handleWithdrawal = async (req, res) => {
    const { withdrawalId, status } = req.body;
    
    try {
        const withdrawal = await Withdrawal.findByPk(withdrawalId, {
            include: [{ model: User }]
        });
        
        if (!withdrawal) {
            return res.json({ success: false, message: 'Withdrawal not found' });
        }

        await withdrawal.update({ status });

        // If rejected, return the amount to user's balance
        if (status === 'rejected') {
            await withdrawal.User.increment('balance', { by: parseFloat(withdrawal.amount) });
            await withdrawal.User.reload();
        }

        res.json({ 
            success: true, 
            message: `Withdrawal ${status}`,
            withdrawal
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