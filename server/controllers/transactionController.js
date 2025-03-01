import Deposit from '../models/Deposit.js';

// Valid USDT deposit methods
const VALID_DEPOSIT_METHODS = ['BINANCE', 'TRC20', 'BEP20', 'ERC20', 'OPTIMISM'];

export const createDeposit = async (req, res) => {
    try {
        const { amount, paymentMethod } = req.body;
        const userId = req.userId;
        
        // Validate payment method
        if (!VALID_DEPOSIT_METHODS.includes(paymentMethod)) {
            return res.json({ 
                success: false, 
                message: 'Invalid payment method. Only USDT deposits are accepted.' 
            });
        }
        
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