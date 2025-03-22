import path from 'path';
import fs from 'fs';
import Deposit from '../models/Deposit.js';
import User from '../models/userModel.js';
import DeletedDeposit from '../models/deletedDepositModel.js';
import { fileURLToPath } from 'url';
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { getSetting } from '../controllers/settingsController.js';

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
        
        // Allow deletion of both pending and approved deposits
        
        // Delete proof image if it exists
        if (deposit.proofImage) {
            const imagePath = path.join(__dirname, '../uploads', deposit.proofImage);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        
        // Handle different statuses
        if (deposit.status !== 'pending' && deposit.status !== 'approved') {
            return res.json({ 
                success: false, 
                message: 'Only pending or approved deposits can be deleted' 
            });
        }
        
        // For approved deposits, we need to keep track of it in the user stats
        let wasApproved = deposit.status === 'approved';
        let depositAmount = parseFloat(deposit.amount);
        
        // Instead of using a "deleted" status, we'll create a record in the DeletedDeposit table
        // to track deleted approved deposits
        if (wasApproved) {
            try {
                // Create a record of the deleted deposit
                await DeletedDeposit.create({
                    userId,
                    originalDepositId: deposit.id,
                    amount: depositAmount,
                    originalCreatedAt: deposit.createdAt
                });
            } catch (error) {
                console.error('Error tracking deleted deposit:', error);
                // Continue with deletion even if tracking fails
            }
        }
        
        // Now we can safely delete the deposit
        await deposit.destroy();
        
        res.json({ 
            success: true, 
            message: wasApproved 
                ? 'Deposit record deleted successfully. The amount will still be reflected in your total deposits.' 
                : 'Deposit deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting deposit:', error);
        res.json({ success: false, message: error.message });
    }
}; 