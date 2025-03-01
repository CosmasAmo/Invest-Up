import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { isAuthenticated, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all settings - accessible to all authenticated users
router.get('/', isAuthenticated, getSettings);

// Update settings - only accessible to admins
router.post('/update', isAuthenticated, isAdmin, updateSettings);

export default router; 