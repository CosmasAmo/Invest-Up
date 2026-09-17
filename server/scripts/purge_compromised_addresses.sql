-- Emergency Database Sanitization
-- Run this query in phpMyAdmin on your cPanel server to instantly clear
-- any attacker wallet addresses stored in the Settings table.

UPDATE `Settings` 
SET `depositAddresses` = JSON_OBJECT() 
WHERE `id` = 1;

-- Verification: check that depositAddresses is now empty ({})
SELECT `id`, `depositAddresses`, `updatedAt` FROM `Settings` WHERE `id` = 1;
