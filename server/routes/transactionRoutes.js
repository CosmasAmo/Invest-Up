import express from 'express';
import userAuth from '../middleware/userAuth.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '../uploads'))
    },
    filename: function(req, file, cb) {
        cb(null, 'proof-' + Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Import the controller (we'll create this next)
import { createDeposit } from '../controllers/transactionController.js';

router.post('/deposit', userAuth, upload.single('proofImage'), createDeposit);

export default router; 