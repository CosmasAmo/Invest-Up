-- Create the Settings table
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
  `depositAddresses` JSON DEFAULT (JSON_OBJECT(
    'BINANCE', '374592285',
    'TRC20', 'TYKbfLuFUUz5T3X2UFvhBuTSNvLE6TQpjX',
    'BEP20', '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
    'ERC20', '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
    'OPTIMISM', '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3'
  )),
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert initial settings if table is empty
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
  JSON_OBJECT(
    'BINANCE', '374592285',
    'TRC20', 'TYKbfLuFUUz5T3X2UFvhBuTSNvLE6TQpjX',
    'BEP20', '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
    'ERC20', '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
    'OPTIMISM', '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3'
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM `Settings` LIMIT 1);

-- Add profitDays column if it doesn't exist (for existing tables)
ALTER TABLE `Settings` 
ADD COLUMN IF NOT EXISTS `profitDays` JSON DEFAULT (JSON_ARRAY(1, 2, 3, 4, 5)) 
AFTER `profitInterval`; 