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
        withdrawalFee: 2,
        referralsRequired: 2
      }
    });

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
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
      withdrawalFee,
      referralsRequired,
      depositAddresses
    } = req.body;

    // Validate inputs
    if (
      referralBonus < 0 ||
      minWithdrawal < 0 ||
      minDeposit < 0 ||
      minInvestment < 0 ||
      profitPercentage < 0 ||
      profitInterval < 1 ||
      withdrawalFee < 0 ||
      referralsRequired < 1
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid settings values. All values must be non-negative.'
      });
    }

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

    // Update settings
    await settings.update({
      referralBonus,
      minWithdrawal,
      minDeposit,
      minInvestment,
      profitPercentage,
      profitInterval,
      withdrawalFee,
      referralsRequired,
      depositAddresses
    });

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
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
        withdrawalFee: 2,
        referralsRequired: 2
      }
    });

    return settings[key];
  } catch (error) {
    console.error(`Error getting setting ${key}:`, error);
    // Return default values if there's an error
    const defaults = {
      referralBonus: 5,
      minWithdrawal: 3,
      minDeposit: 3,
      minInvestment: 3,
      profitPercentage: 5,
      profitInterval: 5,
      withdrawalFee: 2,
      referralsRequired: 2
    };
    return defaults[key] || null;
  }
}; 