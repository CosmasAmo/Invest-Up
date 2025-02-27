import Investment from '../models/Investment.js';
import User from '../models/userModel.js';

export const createInvestment = async (req, res) => {
    try {
        const { amount } = req.body;
        const userId = req.userId;
        
        const user = await User.findByPk(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        if (parseFloat(amount) < 3) {
            return res.json({ success: false, message: 'Minimum investment amount is $3' });
        }

        if (parseFloat(amount) > parseFloat(user.balance)) {
            return res.json({ success: false, message: 'Insufficient balance' });
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