import Settings from '../models/Settings.js';

// ============================================================
// Helper: Read deposit addresses from environment variables.
// These are NEVER stored in the database or hardcoded.
// To set addresses, add them to the server .env file:
//   WALLET_BINANCE=your_binance_id
//   WALLET_TRC20=your_trc20_address
//   WALLET_BEP20=your_bep20_address
//   WALLET_ERC20=your_erc20_address
//   WALLET_OPTIMISM=your_optimism_address
// ============================================================
export const getEnvDepositAddresses = () => {
  const addresses = {};
  // Named convenience keys
  if (process.env.WALLET_BINANCE)  addresses.BINANCE  = process.env.WALLET_BINANCE.trim();
  if (process.env.WALLET_TRC20)    addresses.TRC20    = process.env.WALLET_TRC20.trim();
  if (process.env.WALLET_BEP20)    addresses.BEP20    = process.env.WALLET_BEP20.trim();
  if (process.env.WALLET_ERC20)    addresses.ERC20    = process.env.WALLET_ERC20.trim();
  if (process.env.WALLET_OPTIMISM) addresses.OPTIMISM = process.env.WALLET_OPTIMISM.trim();
  // Dynamic: any WALLET_<METHOD> key not already covered above
  Object.keys(process.env).forEach(envKey => {
    if (envKey.startsWith('WALLET_')) {
      const methodKey = envKey.substring(7).toUpperCase();
      if (!addresses[methodKey] && process.env[envKey]) {
        addresses[methodKey] = process.env[envKey].trim();
      }
    }
  });
  return addresses;
};

// Initialize settings if they don't exist
export const initializeSettings = async () => {
  try {
    const count = await Settings.count();
    if (count === 0) {
      await Settings.create({
        referralBonus: 5,
        minWithdrawal: 3,
        minDeposit: 3,
        minInvestment: 3,
        profitPercentage: 5,
        profitInterval: 5,
        profitDays: [1, 2, 3, 4, 5], // Default to weekdays
        withdrawalFee: 2,
        referralsRequired: 2,
        depositAddresses: {} // Never stored – served from .env at runtime
      });
      console.log('Settings initialized successfully');
    } else {
      // Purge any legacy or compromised addresses previously stored in the database
      const existing = await Settings.findByPk(1);
      if (existing && existing.depositAddresses && Object.keys(existing.depositAddresses).length > 0) {
        console.log('Purging legacy deposit addresses from database settings table...');
        await existing.update({ depositAddresses: {} });
        console.log('Database deposit addresses wiped to empty object.');
      }
    }
  } catch (error) {
    console.error('Error initializing settings:', error);
  }
};

// Get all settings
export const getSettings = async (req, res) => {
  try {
    // Get the first settings record or create default if none exists
    const [settings] = await Settings.findOrCreate({
      where: { id: 1 },
      defaults: {
        referralBonus: 5,
        minWithdrawal: 3,
        minDeposit: 3,
        minInvestment: 3,
        profitPercentage: 5,
        profitInterval: 5,
        profitDays: [1, 2, 3, 4, 5], // Default to weekdays
        withdrawalFee: 2,
        referralsRequired: 2,
        depositAddresses: {}
      }
    });

    // Parse profitDays if it's a string
    if (typeof settings.profitDays === 'string') {
      try {
        settings.profitDays = JSON.parse(settings.profitDays);
      } catch (parseError) {
        console.error('Error parsing profitDays:', parseError);
        settings.profitDays = [1, 2, 3, 4, 5]; // Default to weekdays
      }
    }
    if (!settings.profitDays) {
      settings.profitDays = [1, 2, 3, 4, 5];
    }

    // Always serve deposit addresses from .env – never from DB
    settings.depositAddresses = getEnvDepositAddresses();

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get settings'
    });
  }
};

// Update settings
export const updateSettings = async (req, res) => {
  try {
    const {
      referralBonus,
      minWithdrawal,
      minDeposit,
      minInvestment,
      profitPercentage,
      profitInterval,
      profitDays,
      withdrawalFee,
      referralsRequired
      // depositAddresses intentionally NOT destructured – they come from .env only
    } = req.body;

    // Validate profit days
    if (!profitDays || !Array.isArray(profitDays) || profitDays.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'You must select at least one profit day'
      });
    }

    // Validate inputs
    if (
      referralBonus < 0 ||
      minWithdrawal < 0 ||
      minDeposit < 0 ||
      minInvestment < 0 ||
      profitInterval < 1 ||
      withdrawalFee < 0 ||
      referralsRequired < 1
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid settings values.'
      });
    }

    // Get the first settings record or create default if none exists
    let settings;
    try {
      [settings] = await Settings.findOrCreate({
        where: { id: 1 },
        defaults: {
          referralBonus: 5,
          minWithdrawal: 3,
          minDeposit: 3,
          minInvestment: 3,
          profitPercentage: 5,
          profitInterval: 5,
          profitDays: [1, 2, 3, 4, 5],
          withdrawalFee: 2,
          referralsRequired: 2,
          depositAddresses: {}
        }
      });
    } catch (dbError) {
      console.error('Database error finding/creating settings:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Database error when accessing settings'
      });
    }

    // Check if profitInterval has changed
    const profitIntervalChanged = settings.profitInterval !== profitInterval;

    // Update the settings – never include depositAddresses
    try {
      await settings.update({
        referralBonus,
        minWithdrawal,
        minDeposit,
        minInvestment,
        profitPercentage,
        profitInterval,
        profitDays,
        withdrawalFee,
        referralsRequired
      });
    } catch (updateError) {
      console.error('Error updating settings:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update settings'
      });
    }

    // If profitInterval was changed, log it and update the scheduler
    if (profitIntervalChanged) {
      console.log(`Profit interval changed from ${settings.profitInterval} to ${profitInterval} minutes`);
      try {
        const serverModule = await import('../server.js');
        if (typeof serverModule.setupProfitCalculationInterval === 'function') {
          await serverModule.setupProfitCalculationInterval();
          console.log('Profit calculation interval scheduler updated successfully');
        } else {
          console.error('setupProfitCalculationInterval function not found in server module');
        }
      } catch (error) {
        console.error('Error updating profit calculation interval scheduler:', error);
      }
    }

    // Return success
    const updatedSettings = await Settings.findByPk(1);
    updatedSettings.depositAddresses = getEnvDepositAddresses();
    return res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: updatedSettings
    });
  } catch (error) {
    console.error('Error in updateSettings:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error when updating settings'
    });
  }
};

// Update platform system settings (strictly decoupled from deposit addresses)
export const updateSystemSettings = async (req, res) => {
  try {
    const {
      referralBonus,
      minWithdrawal,
      minDeposit,
      minInvestment,
      profitPercentage,
      profitInterval,
      profitDays,
      withdrawalFee,
      referralsRequired
    } = req.body;

    // Validate profit days
    if (!profitDays || !Array.isArray(profitDays) || profitDays.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'You must select at least one profit day'
      });
    }

    // Validate inputs
    if (
      referralBonus < 0 ||
      minWithdrawal < 0 ||
      minDeposit < 0 ||
      minInvestment < 0 ||
      profitInterval < 1 ||
      withdrawalFee < 0 ||
      referralsRequired < 1
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid settings values.'
      });
    }

    let settings;
    try {
      [settings] = await Settings.findOrCreate({
        where: { id: 1 },
        defaults: {
          referralBonus: 5,
          minWithdrawal: 3,
          minDeposit: 3,
          minInvestment: 3,
          profitPercentage: 5,
          profitInterval: 5,
          profitDays: [1, 2, 3, 4, 5],
          withdrawalFee: 2,
          referralsRequired: 2,
          depositAddresses: {}
        }
      });
    } catch (dbError) {
      console.error('Database error finding/creating settings:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Database error when accessing settings'
      });
    }

    // Check if profitInterval has changed
    const profitIntervalChanged = settings.profitInterval !== profitInterval;

    // Update system settings ONLY - never touch depositAddresses
    try {
      await settings.update({
        referralBonus,
        minWithdrawal,
        minDeposit,
        minInvestment,
        profitPercentage,
        profitInterval,
        profitDays,
        withdrawalFee,
        referralsRequired
      });
    } catch (updateError) {
      console.error('Error updating system settings:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update system settings'
      });
    }

    if (profitIntervalChanged) {
      console.log(`Profit interval changed from ${settings.profitInterval} to ${profitInterval} minutes`);
      try {
        const serverModule = await import('../server.js');
        if (typeof serverModule.setupProfitCalculationInterval === 'function') {
          await serverModule.setupProfitCalculationInterval();
          console.log('Profit calculation interval scheduler updated successfully');
        }
      } catch (error) {
        console.error('Error updating profit calculation interval scheduler:', error);
      }
    }

    const updatedSettings = await Settings.findByPk(1);
    updatedSettings.depositAddresses = getEnvDepositAddresses();
    return res.json({
      success: true,
      message: 'System configuration updated successfully',
      settings: updatedSettings
    });
  } catch (error) {
    console.error('Error in updateSystemSettings:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error when updating system settings'
    });
  }
};

// Update payment addresses (locked – addresses come from .env only)
export const updatePaymentAddresses = async (req, res) => {
  return res.status(403).json({
    success: false,
    message: 'Payment addresses are managed via server environment variables (.env). They cannot be changed through this API.'
  });
};

// Get a specific setting by key
export const getSetting = async (key) => {
  try {
    // depositAddresses always come from .env, never from DB
    if (key === 'depositAddresses') {
      return getEnvDepositAddresses();
    }

    const [settings] = await Settings.findOrCreate({
      where: { id: 1 },
      defaults: {
        referralBonus: 5,
        minWithdrawal: 3,
        minDeposit: 3,
        minInvestment: 3,
        profitPercentage: 5,
        profitInterval: 5,
        profitDays: [1, 2, 3, 4, 5], // Default to weekdays
        withdrawalFee: 2,
        referralsRequired: 2,
        depositAddresses: {}
      }
    });

    // Special handling for profitDays
    if (key === 'profitDays') {
      if (typeof settings[key] === 'string') {
        try {
          return JSON.parse(settings[key]);
        } catch (parseError) {
          console.error('Error parsing profitDays:', parseError);
          return [1, 2, 3, 4, 5]; // Default to weekdays
        }
      }
      return settings[key] || [1, 2, 3, 4, 5];
    }

    return settings[key];
  } catch (error) {
    console.error(`Error getting setting ${key}:`, error);
    if (key === 'depositAddresses') {
      return getEnvDepositAddresses(); // Still from .env even on error
    } else if (key === 'profitDays') {
      return [1, 2, 3, 4, 5]; // Default to weekdays
    }
    return null;
  }
};

// Get public settings - accessible without authentication
export const getPublicSettings = async (req, res) => {
  console.log('getPublicSettings called');
  
  try {
    // Get the first settings record or create default if none exists
    console.log('Fetching settings from database...');
    const [settings] = await Settings.findOrCreate({
      where: { id: 1 },
      defaults: {
        referralBonus: 5,
        minWithdrawal: 3,
        minDeposit: 3,
        minInvestment: 3,
        profitPercentage: 5,
        profitInterval: 5,
        withdrawalFee: 2,
        referralsRequired: 2,
        depositAddresses: {}
      }
    });
    console.log('Settings retrieved:', settings ? 'Found' : 'Not found');

    // Always serve deposit addresses from .env – never from DB
    const depositAddresses = getEnvDepositAddresses();
    console.log('depositAddresses sourced from .env, keys:', Object.keys(depositAddresses));

    // Only return a subset of settings that are safe for public consumption
    const publicSettings = {
      minDeposit: settings.minDeposit,
      minInvestment: settings.minInvestment,
      profitPercentage: settings.profitPercentage,
      referralBonus: settings.referralBonus,
      referralsRequired: settings.referralsRequired,
      depositAddresses
    };
    
    console.log('Sending public settings response');
    
    // Explicitly set CORS headers for this public endpoint
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');
    
    res.json({
      success: true,
      settings: publicSettings
    });
    console.log('Public settings response sent successfully');
  } catch (error) {
    console.error('Error getting public settings:', error);
    console.log('Sending default settings due to error');
    
    // Explicitly set CORS headers for this public endpoint
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');
    
    res.json({
      success: true,
      settings: {
        minDeposit: 3,
        minInvestment: 3,
        profitPercentage: 5,
        referralBonus: 5,
        referralsRequired: 2,
        depositAddresses: getEnvDepositAddresses()
      }
    });
    console.log('Default settings response sent successfully');
  }
};