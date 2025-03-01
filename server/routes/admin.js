const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const Transaction = require('../models/Transaction');

// Add this route to your admin routes
router.get('/transactions/recent', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Fetch the most recent transactions
    const transactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email avatar')
      .lean();
    
    res.json({ success: true, transactions });
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch recent transactions' });
  }
});

// Export the router
module.exports = router; 