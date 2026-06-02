import Investment from '../models/Investment.js';
import User from '../models/userModel.js';
import { getSetting } from './settingsController.js';
import DeletedInvestment from '../models/deletedInvestmentModel.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

        // Get daily profit rate from settings
        const dailyProfitRate = await getSetting('profitPercentage');
        if (!dailyProfitRate) {
            return res.json({ success: false, message: 'Profit percentage not set in settings' });
        }

        // Check if user already has an approved investment
        const existingInvestment = await Investment.findOne({
            where: { 
                userId,
                status: 'approved'
            }
        });

        let investment;
        
        if (existingInvestment) {
            // Add to existing investment instead of creating a new one
            const newTotalAmount = parseFloat(existingInvestment.amount) + parseFloat(amount);
            
            // Update existing investment with new amount
            await existingInvestment.update({
                amount: newTotalAmount.toFixed(2),
                // Reset lastProfitUpdate to now since we're adding more funds
                lastProfitUpdate: new Date()
            });
            
            investment = existingInvestment;
        } else {
            // Create new investment if no existing approved investment
            investment = await Investment.create({
                userId,
                amount,
                status: 'approved',
                dailyProfitRate: dailyProfitRate,
                lastProfitUpdate: new Date(),
                totalProfit: 0.00
            });
        }

        // Deduct the amount from user's balance immediately
        await user.decrement('balance', { by: parseFloat(amount) });
        await user.reload();

        res.json({ 
            success: true, 
            message: existingInvestment ? 'Investment amount added to existing investment' : 'Investment created successfully',
            investment: {
                ...investment.toJSON(),
                transactionId: investment.transactionId
            }
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

        // Get daily profit rate from settings when approving
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

        // Get deleted investments
        const deletedInvestments = await DeletedInvestment.findAll({
            where: { userId }
        });

        // Calculate investment statistics including deleted investments
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

        // We're no longer adding deleted investments to the totals
        // to show only active investments

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
                dailyReturn: parseFloat(inv.amount) * (parseFloat(inv.dailyProfitRate || 0) / 100)
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
        const availableBalance = parseFloat(user.balance) + parseFloat(investment.amount);
        if (parseFloat(amount) > availableBalance) {
            return res.json({ success: false, message: 'Insufficient balance' });
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

        // Check if the investment is approved
        if (investment.status === 'approved') {
            return res.json({
                success: false,
                message: 'Approved investments cannot be deleted. Please use the hide option instead.'
            });
        }

        // Get the user to update their balance
        const user = await User.findByPk(userId);
        if (!user) {
            return res.json({
                success: false,
                message: 'User not found'
            });
        }

        // Store the investment in DeletedInvestment before deleting
        await DeletedInvestment.create({
            userId: investment.userId,
            originalInvestmentId: investment.id,
            amount: investment.amount,
            profit: investment.totalProfit,
            status: investment.status,
            originalCreatedAt: investment.createdAt
        });

        // Refund the invested amount to user's balance
        await user.increment('balance', { by: parseFloat(investment.amount) });
        await user.reload();

        // Delete the investment
        await investment.destroy();

        res.json({
            success: true,
            message: 'Investment deleted successfully and amount refunded'
        });
    } catch (error) {
        console.error('Error deleting investment:', error);
        res.json({ success: false, message: error.message });
    }
};

export const getTotalInvestments = async (req, res) => {
    try {
        const userId = req.userId;

        // Get total from active investments only
        const activeInvestments = await Investment.sum('amount', {
            where: { 
                userId,
                status: 'approved' 
            }
        });

        const totalInvestments = (activeInvestments || 0);

        res.json({
            success: true,
            totalInvestments
        });
    } catch (error) {
        console.error('Error getting total investments:', error);
        res.json({ success: false, message: error.message });
    }
};

export const getTotalProfits = async (req, res) => {
    try {
        const userId = req.userId;

        // Get total from active investments
        const activeProfits = await Investment.sum('totalProfit', {
            where: { userId }
        });

        // Get total from deleted investments
        const deletedProfits = await DeletedInvestment.sum('profit', {
            where: { userId }
        });

        const totalProfits = (activeProfits || 0) + (deletedProfits || 0);

        res.json({
            success: true,
            totalProfits
        });
    } catch (error) {
        console.error('Error getting total profits:', error);
        res.json({ success: false, message: error.message });
    }
};

export const getUserStats = async (req, res) => {
    try {
        const userId = req.userId;
        
        const investments = await Investment.findAll({
            where: { userId }
        });

        // Get deleted investments
        const deletedInvestments = await DeletedInvestment.findAll({
            where: { userId }
        });

        // Calculate total investments and profits including deleted investments
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

        // Add deleted investments to totals
        deletedInvestments.forEach(inv => {
            stats.totalInvestments += parseFloat(inv.amount);
            stats.totalProfit += parseFloat(inv.profit || 0);
        });

        res.json({ 
            success: true,
            stats
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const toggleInvestmentHidden = async (req, res) => {
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
        
        // Only approved investments can be hidden/unhidden
        if (investment.status !== 'approved') {
            return res.json({ 
                success: false, 
                message: 'Only approved investments can be hidden or unhidden' 
            });
        }
        
        // Toggle the hidden status
        const newHiddenStatus = !investment.hidden;
        await investment.update({ hidden: newHiddenStatus });
        
        return res.json({ 
            success: true, 
            message: newHiddenStatus 
                ? 'Investment hidden successfully' 
                : 'Investment unhidden successfully',
            hidden: newHiddenStatus
        });
        
    } catch (error) {
        console.error('Error toggling investment hidden status:', error);
        res.json({ success: false, message: error.message });
    }
};

export const stopInvestment = async (req, res) => {
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
        
        // Check if investment is approved
        if (investment.status !== 'approved') {
            return res.json({ 
                success: false, 
                message: 'Only active investments can be stopped' 
            });
        }
        
        // Get the user
        const user = await User.findByPk(userId);
        if (!user) {
            return res.json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        // Update investment status to 'stopped'
        await investment.update({
            status: 'stopped'
        });
        
        // Verify the update was successful
        await investment.reload();
        console.log(`Investment ${investmentId} status updated to: ${investment.status}`);
        
        // Refund the investment amount to user's balance
        await user.increment('balance', { by: parseFloat(investment.amount) });
        
        // Reload user to get updated balance
        await user.reload();
        
        res.json({ 
            success: true, 
            message: 'Investment stopped successfully. The amount has been refunded to your balance.',
            updatedBalance: user.balance 
        });
        
    } catch (error) {
        console.error('Error stopping investment:', error);
        res.json({ success: false, message: error.message || 'An error occurred while stopping the investment.' });
    }
}; 