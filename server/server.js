import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MySQLStore from 'express-mysql-session';
import passport from 'passport';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import sequelize from './config/database.js';
import './config/googleAuth.js';

import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import transactionRouter from './routes/transactionRoutes.js';
import investmentRoutes from './routes/investmentRoutes.js';
import withdrawalRouter from './routes/withdrawalRoutes.js';
import settingsRouter from './routes/settingsRoutes.js';

import { auditLogMiddleware } from './middleware/auditLogMiddleware.js';
import { startProfitCron } from './cron/profitCron.js';
import { calculateAndUpdateProfits } from './services/profitService.js';
import { initializeSettings } from './controllers/settingsController.js';

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =====================================================
   CORS – SINGLE, SAFE, STABLE CONFIGURATION
===================================================== */

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5000',

  'http://investuptrading.com',
  'https://investuptrading.com',

  'http://www.investuptrading.com',
  'https://www.investuptrading.com',

  'https://backend.investuptrading.com',
  'https://www.backend.investuptrading.com'
];


const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server, images, curl, cron, redirects
    if (!origin) return callback(null, true);

    // Allow exact matches
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow all subdomains safely
    if (origin.endsWith('.investuptrading.com')) {
      return callback(null, true);
    }

    // ❌ DO NOT THROW ERRORS (causes instability)
    console.warn('Blocked CORS origin:', origin);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept'
  ],
  optionsSuccessStatus: 204
};

// ✅ CORS MUST COME FIRST
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

/* =====================================================
   BASIC MIDDLEWARE
===================================================== */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'cookie_secret'));
app.use(auditLogMiddleware);

/* =====================================================
   SESSION CONFIG
===================================================== */

const MySQLSessionStore = MySQLStore(session);

const sessionStore =
  process.env.NODE_ENV === 'production'
    ? new MySQLSessionStore({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        createDatabaseTable: true
      })
    : new session.MemoryStore();

app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);

/* =====================================================
   PASSPORT
===================================================== */

app.use(passport.initialize());
app.use(passport.session());

/* =====================================================
   UPLOADS
===================================================== */

const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use('/uploads', express.static(uploadsPath));

/* =====================================================
   DATABASE
===================================================== */

sequelize
  .authenticate()
  .then(() => {
    console.log('✅ Database connected');
    return sequelize.sync({ alter: false });
  })
  .then(() => initializeSettings())
  .catch(err => console.error('❌ DB error:', err));

/* =====================================================
   ROUTES
===================================================== */

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/transactions', transactionRouter);
app.use('/api/investments', investmentRoutes);
app.use('/api/withdrawals', withdrawalRouter);
app.use('/api/settings', settingsRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', time: new Date().toISOString() });
});

/* =====================================================
   REACT BUILD
===================================================== */

const clientPath = '/home/investup/public_html';
if (fs.existsSync(clientPath)) {
  app.use(express.static(clientPath));
  app.get('*', (_, res) =>
    res.sendFile(path.join(clientPath, 'index.html'))
  );
}

// ================== PROFIT CALCULATION SYSTEM ==================
startProfitCron();
let profitIntervalTimer;

export const setupProfitCalculationInterval = async () => {
    if (profitIntervalTimer) {
        clearInterval(profitIntervalTimer);
        console.log('Cleared existing profit calculation interval');
    }
    
    try {
        // Import getSetting function using dynamic import with proper error handling
        let getSetting;
        try {
            const settingsController = await import('./controllers/settingsController.js');
            getSetting = settingsController.getSetting;
        } catch (importError) {
            console.error('Error importing settings controller:', importError);
            throw importError;
        }
        
        const intervalMinutes = await getSetting('profitInterval') || 60;

        // Validate and limit the interval
        const MIN_INTERVAL_MINUTES = 1;
        const MAX_SAFE_INTERVAL_MS = 2147483647; // Maximum 32-bit signed integer in milliseconds
        
        let validInterval = parseInt(intervalMinutes);
        if (isNaN(validInterval) || validInterval < MIN_INTERVAL_MINUTES) {
            console.warn(`Invalid profit interval ${intervalMinutes}, using minimum value of ${MIN_INTERVAL_MINUTES} minutes`);
            validInterval = MIN_INTERVAL_MINUTES;
        }
        
        // Convert to milliseconds
        const intervalMs = validInterval * 60 * 1000;
        
        console.log(`Setting up profit calculation interval for every ${validInterval} minutes (${intervalMs}ms)`);
        
        // Clear any existing interval
        if (profitIntervalTimer) {
            clearTimeout(profitIntervalTimer);
        }
        
        // For very large intervals, use setTimeout recursively instead of setInterval
        const scheduleNextCalculation = async () => {
            try {
                console.log(`Running scheduled profit calculation at ${new Date().toISOString()}`);
                const result = await calculateAndUpdateProfits();
                console.log(`Profit calculation completed: ${result ? 'Success' : 'Skipped'}`);
            } catch (error) {
                console.error('Error in profit calculation:', error);
            } finally {
                // Schedule next calculation using a safe interval
                const nextInterval = Math.min(intervalMs, MAX_SAFE_INTERVAL_MS);
                profitIntervalTimer = setTimeout(scheduleNextCalculation, nextInterval);
            }
        };
        
        // Start the first calculation with a safe interval
        const initialInterval = Math.min(intervalMs, MAX_SAFE_INTERVAL_MS);
        profitIntervalTimer = setTimeout(scheduleNextCalculation, initialInterval);
    } catch (error) {
        console.error('Error setting up profit calculation interval:', error);
    }
}; 

// ================== SERVER STARTUP ==================
try {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`Server URL: ${process.env.SERVER_URL || 'Not configured'}`);
        console.log(`Database Host: ${process.env.DB_HOST || 'Not configured'}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`Port ${port} is already in use. Trying ${port + 1}...`);
            const alternatePort = port + 1;
            app.listen(alternatePort, () => {
                console.log(`Server running on alternate port ${alternatePort}`);
            });
        } else {
            console.error('Server error:', err);
            console.error('Stack trace:', err.stack);
        }
    });
} catch (error) {
    console.error('Critical server startup error:', error);
    console.error('Stack trace:', error.stack);
}

// Keep process running even if there's an uncaught exception
process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    console.error('Stack trace:', err.stack);
    // Don't exit the process
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise);
    console.error('Reason:', reason);
    // Don't exit the process
});