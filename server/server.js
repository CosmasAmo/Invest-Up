import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
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
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
const port = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================== INITIAL CONFIGURATION ==================
const FALLBACK_MODE = process.env.FALLBACK_MODE === 'true';
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5000',
    'https://accounts.google.com',
    'https://investuptrading.com',
    'https://www.investuptrading.com'
];

// ================== MIDDLEWARE SETUP ==================
app.use(express.json());
app.use(cookieParser());
app.use(auditLogMiddleware);

// ================== CORS CONFIGURATION ==================
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ================== SESSION CONFIGURATION ==================
let sessionStore;
if (process.env.NODE_ENV === 'production' && !FALLBACK_MODE) {
    try {
        const PgStore = pgSession(session);
        const pgPool = new Pool({
            connectionString: process.env.POSTGRES_URL,
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 30000
        });
        sessionStore = new PgStore({
            pool: pgPool,
            tableName: 'user_sessions',
            createTableIfMissing: true
        });
    } catch (error) {
        console.error('Failed to create PostgreSQL session store:', error);
        sessionStore = new session.MemoryStore();
    }
} else {
    sessionStore = new session.MemoryStore();
}

app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'session_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        path: '/'
    }
}));

// ================== PASSPORT AUTHENTICATION ==================
app.use(passport.initialize());
app.use(passport.session());

// ================== FILE UPLOADS CONFIGURATION ==================
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use('/uploads', express.static(uploadsPath, {
    setHeaders: (res, path) => {
        res.header('Cache-Control', 'public, max-age=86400');
        if (path.match(/\.(jpg|jpeg|png|gif)$/)) {
            res.setHeader('Content-Type', `image/${path.split('.').pop()}`);
        }
    }
}));

// ================== DATABASE CONNECTION ==================
const testDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Database connected successfully!");
    } catch (error) {
        console.error("❌ Database connection error:", error);
    }
};

if (!FALLBACK_MODE) {
    sequelize.sync({ alter: false })
        .then(() => {
            console.log("✅ Database synced successfully!");
            initializeSettings();
        })
        .catch(err => console.error("❌ Database sync error:", err));
    testDB();
}

// ================== API ROUTES ==================
app.get('/', (req, res) => res.send('API working fine!'));

// Core API endpoints
app.get('/config', (req, res) => {
    res.json({
        success: true,
        serverUrl: `${req.protocol}://${req.get('host')}`,
        uploadsUrl: `${req.protocol}://${req.get('host')}/uploads`
    });
});

// Mount all API routes under /api
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/transactions', transactionRouter);
app.use('/api/withdrawals', withdrawalRouter);
app.use('/api/settings', settingsRouter);

// Update the test endpoint
app.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'API is working properly',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Update the 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'API endpoint not found',
        availableEndpoints: [
            '/api/auth/login',
            '/api/auth/register',
            '/api/user/profile',
            '/api/transactions',
            '/api/investments'
        ]
    });
});

// ================== PROFIT CALCULATION SYSTEM ==================
startProfitCron();
let profitIntervalTimer;

const setupProfitCalculationInterval = async () => {
    if (profitIntervalTimer) clearInterval(profitIntervalTimer);
    
    try {
        const { getSetting } = await import('./controllers/settingsController.js');
        const intervalMinutes = await getSetting('profitInterval') || 60;
        const intervalMs = parseInt(intervalMinutes) * 60 * 1000;

        profitIntervalTimer = setInterval(async () => {
            try {
                await calculateAndUpdateProfits();
            } catch (error) {
                console.error('Error in profit calculation:', error);
            }
        }, intervalMs);
    } catch (error) {
        console.error('Error setting up profit interval:', error);
        profitIntervalTimer = setInterval(async () => {
            try {
                await calculateAndUpdateProfits();
            } catch (error) {
                console.error('Error in fallback profit calculation:', error);
            }
        }, 60 * 60 * 1000);
    }
};

setupProfitCalculationInterval();
calculateAndUpdateProfits().catch(console.error);

// ================== SERVER STARTUP ==================
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    if (FALLBACK_MODE) console.log('⚠️ Running in FALLBACK MODE');
});