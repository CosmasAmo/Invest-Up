import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import authRouter from './routes/authRoutes.js'
import userRouter from './routes/userRoutes.js'
import adminRouter from './routes/adminRoutes.js';
import sequelize from './config/database.js';
import passport from 'passport';
import './config/googleAuth.js';
import path from 'path';
import { fileURLToPath } from 'url';
import transactionRouter from './routes/transactionRoutes.js';
import fs from 'fs';
import { startProfitCron } from './cron/profitCron.js';
import investmentRoutes from './routes/investmentRoutes.js';
import withdrawalRouter from './routes/withdrawalRoutes.js';
import settingsRouter from './routes/settingsRoutes.js';
import { calculateAndUpdateProfits } from './services/profitService.js';
import { auditLogMiddleware } from './middleware/auditLogMiddleware.js';
import { initializeSettings } from './controllers/settingsController.js';

const app = express();
const port = process.env.PORT || 5000;

// Force sync to create new tables
sequelize.sync({ alter: true }).then(() => {
  console.log("✅ Database synced successfully!");
  // Initialize settings after database sync
  initializeSettings();
});

const testDB = async () => {
    try {
      await sequelize.authenticate();
      console.log("✅ Database connected successfully!");
    } catch (error) {
      console.error("❌ Database connection error:", error);
    }
  };
  
  testDB();

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5000',
    'http://localhost:8080',
    'https://accounts.google.com',
    // Add your local network address
    `http://localhost:5173`,
    `http://localhost:8080`,
    `http://192.168.100.60:5173`, // Your current IP address
    `http://192.168.100.60:8080`, // Your current IP address with port 8080
    // Add your production domain if needed
    process.env.NODE_ENV === 'production' 
        ? 'https://yourdomain.com' 
        : '*' // Allow all origins in development
];

app.use(express.json());
app.use(cookieParser());

// Simple CORS configuration for development
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5000', 'http://localhost:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Add session middleware before passport initialization
app.use(session({
    secret: process.env.SESSION_SECRET || 'session_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', 
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        httpOnly: true
    }
}));

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Add this before your routes
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

app.get('/', (req, res) => res.send('API working fine!'));
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/admin', adminRouter)
app.use('/api/transactions', transactionRouter);
app.use('/api/investments', investmentRoutes);
app.use('/api/withdrawals', withdrawalRouter);
app.use('/api/settings', settingsRouter);

// Add this before your routes
app.use(auditLogMiddleware);

// Add after your other initializations
startProfitCron();

// Use the newer profitService that already has weekend checks
setInterval(calculateAndUpdateProfits, 60 * 60 * 1000); // Check every hour instead of every minute

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});


