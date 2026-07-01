import Settings from '../models/Settings.js';

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
        depositAddresses: {
          BINANCE: '374592285',
          TRC20: 'TYKbfLuFUUz5T3X2UFvhBuTSNvLE6TQpjX',
          BEP20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
          ERC20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
          OPTIMISM: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3'
        }
      });
      console.log('Settings initialized successfully');
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
        depositAddresses: {
          BINANCE: '374592285',
          TRC20: 'TYKbfLuFUUz5T3X2UFvhBuTSNvLE6TQpjX',
          BEP20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
          ERC20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
          OPTIMISM: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3'
        }
      }
    });

    // Parse depositAddresses if it's a string
    if (typeof settings.depositAddresses === 'string') {
      try {
        settings.depositAddresses = JSON.parse(settings.depositAddresses);
      } catch (parseError) {
        console.error('Error parsing depositAddresses:', parseError);
        // Set default addresses on parse error
        settings.depositAddresses = {
          BINANCE: '374592285',
          TRC20: 'TYKbfLuFUUz5T3X2UFvhBuTSNvLE6TQpjX',
          BEP20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
          ERC20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
          OPTIMISM: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3'
        };
      }
    }
    
    // Parse profitDays if it's a string
    if (typeof settings.profitDays === 'string') {
      try {
        settings.profitDays = JSON.parse(settings.profitDays);
      } catch (parseError) {
        console.error('Error parsing profitDays:', parseError);
        // Set default days on parse error
        settings.profitDays = [1, 2, 3, 4, 5]; // Default to weekdays
      }
    }

    // Ensure depositAddresses exists (backward compatibility)
    if (!settings.depositAddresses) {
      settings.depositAddresses = {
        BINANCE: '374592285',
        TRC20: 'TYKbfLuFUUz5T3X2UFvhBuTSNvLE6TQpjX',
        BEP20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
        ERC20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
        OPTIMISM: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3'
      };
    }
    
    // Ensure profitDays exists (backward compatibility)
    if (!settings.profitDays) {
      settings.profitDays = [1, 2, 3, 4, 5]; // Default to weekdays
    }

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
      referralsRequired,
      depositAddresses
    } = req.body;

    // Validate profit days
    if (!profitDays || !Array.isArray(profitDays) || profitDays.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'You must select at least one profit day'
      });
    }

    // Validate deposit addresses
    if (!depositAddresses || typeof depositAddresses !== 'object') {
      console.error('Invalid depositAddresses format', { 
        type: typeof depositAddresses, 
        value: depositAddresses 
      });
      return res.status(400).json({
        success: false,
        message: 'Invalid deposit addresses format'
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
          profitDays: [1, 2, 3, 4, 5], // Default to weekdays
          withdrawalFee: 2,
          referralsRequired: 2,
          depositAddresses: {
            BINANCE: '374592285',
            TRC20: 'TYKbfLuFUUz5T3X2UFvhBuTSNvLE6TQpjX',
            BEP20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
            ERC20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
            OPTIMISM: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3'
          }
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

    // Update the settings
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
        referralsRequired,
        depositAddresses
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
      
      // Update the profit calculation interval by importing and calling setupProfitCalculationInterval
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
    return res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: await Settings.findByPk(1)
    });
  } catch (error) {
    console.error('Error in updateSettings:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error when updating settings'
    });
  }
};

// Get a specific setting by key
export const getSetting = async (key) => {
  try {
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
        depositAddresses: {
          BINANCE: '374592285',
          TRC20: 'TYKbfLuFUUz5T3X2UFvhBuTSNvLE6TQpjX',
          BEP20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
          ERC20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
          OPTIMISM: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3'
        }
      }
    });

    // Special handling for depositAddresses
    if (key === 'depositAddresses' && typeof settings[key] === 'string') {
      try {
        return JSON.parse(settings[key]);
      } catch (parseError) {
        console.error('Error parsing depositAddresses:', parseError);
        // Return default addresses on parse error
        return {
          BINANCE: '374592285',
          TRC20: 'TYKbfLuFUUz5T3X2UFvhBuTSNvLE6TQpjX',
          BEP20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
          ERC20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
          OPTIMISM: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3'
        };
      }
    }
    
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
      return settings[key] || [1, 2, 3, 4, 5]; // Return default if not set
    }

    return settings[key];
  } catch (error) {
    console.error(`Error getting setting ${key}:`, error);
    // Return default values for specific keys
    if (key === 'depositAddresses') {
      return {
        BINANCE: '374592285',
        TRC20: 'TYKbfLuFUUz5T3X2UFvhBuTSNvLE6TQpjX',
        BEP20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
        ERC20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
        OPTIMISM: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3'
      };
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
        depositAddresses: {
          BINANCE: '374592285',
          TRC20: 'TYKbfLuFUUz5T3X2UFvhBuTSNvLE6TQpjX',
          BEP20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
          ERC20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
          OPTIMISM: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3'
        }
      }
    });
    console.log('Settings retrieved:', settings ? 'Found' : 'Not found');

    // Parse depositAddresses if it's a string
    let depositAddresses = settings.depositAddresses;
    console.log('Raw depositAddresses type:', typeof depositAddresses);
    
    if (typeof depositAddresses === 'string') {
      try {
        console.log('Parsing depositAddresses string');
        depositAddresses = JSON.parse(depositAddresses);
        console.log('Successfully parsed depositAddresses');
      } catch (parseError) {
        console.error('Error parsing depositAddresses:', parseError);
        // Fallback to default addresses
        depositAddresses = {
          BINANCE: '374592285',
          TRC20: 'TYKbfLuFUUz5T3X2UFvhBuTSNvLE6TQpjX',
          BEP20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
          ERC20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
          OPTIMISM: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3'
        };
        console.log('Using default depositAddresses after parse error');
      }
    }

    // Only return a subset of settings that are safe for public consumption
    const publicSettings = {
      minDeposit: settings.minDeposit,
      minInvestment: settings.minInvestment,
      profitPercentage: settings.profitPercentage,
      referralBonus: settings.referralBonus,
      referralsRequired: settings.referralsRequired,
      depositAddresses: depositAddresses
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
    // Return default public settings on error
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
        depositAddresses: {
          BINANCE: '374592285',
          TRC20: 'TYKbfLuFUUz5T3X2UFvhBuTSNvLE6TQpjX',
          BEP20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
          ERC20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
          OPTIMISM: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3'
        }
      }
    });
    console.log('Default settings response sent successfully');
  }
}; 