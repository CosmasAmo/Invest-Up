-- Create the Settings table
-- NOTE: depositAddresses is stored as an empty object.
-- Wallet addresses are read at runtime from server environment variables (.env).
CREATE TABLE IF NOT EXISTS `Settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `referralBonus` FLOAT DEFAULT 5,
  `minWithdrawal` FLOAT DEFAULT 3,
  `minDeposit` FLOAT DEFAULT 3,
  `minInvestment` FLOAT DEFAULT 3,
  `profitPercentage` FLOAT DEFAULT 5,
  `profitInterval` INT DEFAULT 5,
  `profitDays` JSON DEFAULT (JSON_ARRAY(1, 2, 3, 4, 5)),
  `withdrawalFee` FLOAT DEFAULT 2,
  `referralsRequired` INT DEFAULT 2,
  `depositAddresses` JSON DEFAULT (JSON_OBJECT()),
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert initial settings if table is empty
-- depositAddresses intentionally stored as empty JSON object {}
-- Actual wallet addresses must be set in server/.env (WALLET_BINANCE, WALLET_TRC20, etc.)
INSERT INTO `Settings` (
  `referralBonus`, 
  `minWithdrawal`, 
  `minDeposit`, 
  `minInvestment`, 
  `profitPercentage`, 
  `profitInterval`, 
  `profitDays`,
  `withdrawalFee`, 
  `referralsRequired`, 
  `depositAddresses`, 
  `createdAt`, 
  `updatedAt`
)
SELECT 
  5, 
  3, 
  3, 
  3, 
  5, 
  5, 
  JSON_ARRAY(1, 2, 3, 4, 5),
  2, 
  2, 
  JSON_OBJECT(),
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM `Settings` LIMIT 1);

-- Add profitDays column if it doesn't exist (for existing tables)
ALTER TABLE `Settings` 
ADD COLUMN IF NOT EXISTS `profitDays` JSON DEFAULT (JSON_ARRAY(1, 2, 3, 4, 5)) 
AFTER `profitInterval`;