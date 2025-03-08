import Investment from '../models/Investment.js';
import User from '../models/userModel.js';
import Deposit from '../models/Deposit.js';
import { getSetting } from './settingsController.js';
import { Op } from 'sequelize';

export const createInvestment = async (req, res) => {
    try {
        const { amount } = req.body;
        const userId = req.userId;
        
        // Get minimum investment amount from settings
        const minInvestment = await getSetting('minInvestment');
        
        const user = await User.findByPk(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        if (parseFloat(amount) < minInvestment) {
            return res.json({ success: false, message: `Minimum investment amount is $${minInvestment}` });
        }

        if (parseFloat(amount) > parseFloat(user.balance)) {
            return res.json({ success: false, message: 'Insufficient balance' });
        }

        // Check if this is the user's first investment
        const existingInvestments = await Investment.findAll({
            where: { userId, status: 'approved' }
        });

        if (existingInvestments.length === 0) {
            // This is the first investment, check if it meets the 50% requirement
            const firstDeposit = await Deposit.findOne({
                where: { userId, status: 'approved' },
                order: [['createdAt', 'ASC']]
            });

            if (firstDeposit) {
                const firstDepositAmount = parseFloat(firstDeposit.amount);
                const minRequiredInvestment = Math.max(firstDepositAmount * 0.5, minInvestment);

                if (parseFloat(amount) < minRequiredInvestment) {
                    return res.json({ 
                        success: false, 
                        message: `Your first investment must be at least 50% of your first deposit (${(firstDepositAmount * 0.5).toFixed(2)}) and not less than the minimum investment amount (${minInvestment}).`
                    });
                }
            }
        }

        const investment = await Investment.create({
            userId,
            amount,
            status: 'pending'
        });

        res.json({ 
            success: true, 
            message: 'Investment request submitted successfully',
            investment
        });

    } catch (error) {
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

        await investment.update({ status });

        if (status === 'approved') {
            await investment.User.decrement('balance', { by: parseFloat(investment.amount) });
            await investment.User.reload();
        }

        res.json({ 
            success: true, 
            message: `Investment ${status}`,
            investment
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getUserInvestments = async (req, res) => {
    try {
        const userId = req.userId;
        
        const investments = await Investment.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });

        // Calculate investment statistics
        const stats = investments.reduce((acc, inv) => {
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

        res.json({ 
            success: true,
            investments: investments.map(inv => ({
                id: inv.id,
                amount: inv.amount,
                status: inv.status,
                dailyProfitRate: inv.dailyProfitRate,
                totalProfit: inv.totalProfit || 0,
                lastProfitUpdate: inv.lastProfitUpdate,
                createdAt: inv.createdAt,
                dailyReturn: parseFloat(inv.amount) * (parseFloat(inv.dailyProfitRate) / 100)
            })),
            stats
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const editInvestment = async (req, res) => {
    try {
        const { investmentId, amount } = req.body;
        const userId = req.userId;
        
        // Find the investment
        const investment = await Investment.findOne({
            where: {
                id: investmentId,
                userId
            }
        });
        
        if (!investment) {
            return res.json({ 
                success: false, 
                message: 'Investment not found' 
            });
        }
        
        // Check if investment is pending
        if (investment.status !== 'pending') {
            return res.json({ 
                success: false, 
                message: 'Only pending investments can be edited' 
            });
        }
        
        // Get minimum investment amount from settings
        const minInvestment = await getSetting('minInvestment');
        
        // Validate amount
        if (parseFloat(amount) < minInvestment) {
            return res.json({ success: false, message: `Minimum investment amount is $${minInvestment}` });
        }
        
        const user = await User.findByPk(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        
        // Check if user has enough balance for the new amount
        // We need to add back the original investment amount since it was already deducted
        const availableBalance = parseFloat(user.balance) + parseFloat(investment.amount);
        if (parseFloat(amount) > availableBalance) {
            return res.json({ success: false, message: 'Insufficient balance' });
        }
        
        // Check if this is the user's first investment
        const existingInvestments = await Investment.findAll({
            where: { 
                userId, 
                status: 'approved',
                id: { [Op.ne]: investmentId } // Exclude current investment
            }
        });

        if (existingInvestments.length === 0) {
            // This is the first investment, check if it meets the 50% requirement
            const firstDeposit = await Deposit.findOne({
                where: { userId, status: 'approved' },
                order: [['createdAt', 'ASC']]
            });

            if (firstDeposit) {
                const firstDepositAmount = parseFloat(firstDeposit.amount);
                const minRequiredInvestment = Math.max(firstDepositAmount * 0.5, minInvestment);

                if (parseFloat(amount) < minRequiredInvestment) {
                    return res.json({ 
                        success: false, 
                        message: `Your first investment must be at least 50% of your first deposit (${(firstDepositAmount * 0.5).toFixed(2)}) and not less than the minimum investment amount (${minInvestment}).`
                    });
                }
            }
        }
        
        // Update the investment
        await investment.update({ amount });
        
        res.json({ 
            success: true, 
            message: 'Investment updated successfully',
            investment
        });
        
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const deleteInvestment = async (req, res) => {
    try {
        const { investmentId } = req.params;
        const userId = req.userId;
        
        // Find the investment
        const investment = await Investment.findOne({
            where: {
                id: investmentId,
                userId
            }
        });
        
        if (!investment) {
            return res.json({ 
                success: false, 
                message: 'Investment not found' 
            });
        }
        
        // Check if investment is pending
        if (investment.status !== 'pending') {
            return res.json({ 
                success: false, 
                message: 'Only pending investments can be deleted' 
            });
        }
        
        // Get the user to refund the amount
        const user = await User.findByPk(userId);
        if (user) {
            // Refund the investment amount to the user's balance
            await user.increment('balance', { by: parseFloat(investment.amount) });
        }
        
        // Delete the investment
        await investment.destroy();
        
        res.json({ 
            success: true, 
            message: 'Investment deleted successfully and amount refunded to your balance'
        });
        
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}; 