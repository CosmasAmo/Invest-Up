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
    storage: storage
});

// Import the controller
import { createDeposit, editDeposit, deleteDeposit } from '../controllers/transactionController.js';

// Deposit routes
router.post('/deposit', userAuth, upload.single('proofImage'), createDeposit);
router.put('/deposit/edit', userAuth, upload.single('proofImage'), editDeposit);
router.delete('/deposit/:depositId', userAuth, deleteDeposit);

export default router; 