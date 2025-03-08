import Deposit from '../models/Deposit.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        
        // Validate payment method
        if (paymentMethod && !VALID_DEPOSIT_METHODS.includes(paymentMethod)) {
            return res.json({ 
                success: false, 
                message: 'Invalid payment method. Only USDT deposits are accepted.' 
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
        
        // Check if deposit is pending
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
        res.json({ success: false, message: error.message });
    }
}; 