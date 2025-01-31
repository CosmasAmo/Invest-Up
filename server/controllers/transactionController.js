import Deposit from '../models/Deposit.js';

export const createDeposit = async (req, res) => {
    try {
        const { amount, paymentMethod } = req.body;
        const userId = req.userId;
        
        if (!req.file) {
            return res.json({ 
                success: false, 
                message: 'Proof of payment is required' 
            });
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
            message: 'Deposit submitted successfully',
            deposit: {
                ...deposit.toJSON(),
                transactionId: deposit.transactionId
            }
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}; 