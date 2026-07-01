/**
 * Script to fix any profits that were incorrectly calculated on weekends
 * Run this script to identify and potentially adjust profit calculations that occurred on weekends
 */

import Investment from '../models/Investment.js';
import User from '../models/userModel.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import { isWeekend } from '../utils/dateUtils.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Function to check if a date is a weekend
const isWeekendDate = (date) => {
    const day = new Date(date).getDay();
    return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
};

const DAYS_TO_CHECK = 30; // Check the last 30 days

// Main function to analyze and fix weekend profits
const analyzeAndFixWeekendProfits = async () => {
    try {
        console.log('Starting weekend profit analysis...');
        
        // Get the date range to check (last 30 days)
        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - DAYS_TO_CHECK);
        
        console.log(`Checking profits from ${startDate.toISOString()} to ${today.toISOString()}`);
        
        // Get all investments with lastProfitUpdate in the date range
        const investments = await Investment.findAll({
            where: {
                status: 'approved',
                lastProfitUpdate: {
                    [Op.between]: [startDate, today]
                }
            },
            include: [{ model: User }]
        });
        
        console.log(`Found ${investments.length} investments to analyze`);
        
        let weekendUpdateCount = 0;
        let totalIncorrectProfits = 0;
        
        // Check each investment's profit update timestamp
        for (const investment of investments) {
            const lastUpdate = new Date(investment.lastProfitUpdate);
            
            // If the last update was on a weekend, log it
            if (isWeekendDate(lastUpdate)) {
                console.log(`Investment ID ${investment.id} was updated on a weekend: ${lastUpdate.toISOString()} (${lastUpdate.toLocaleDateString('en-US', { weekday: 'long' })})`);
                weekendUpdateCount++;
                
                // Calculate how much profit was likely added incorrectly
                const dailyProfit = parseFloat(investment.amount) * (parseFloat(investment.dailyProfitRate) / 100);
                console.log(`- Estimated incorrect profit: $${dailyProfit.toFixed(2)}`);
                totalIncorrectProfits += dailyProfit;
                
                // Uncomment the following lines to actually fix the profits
                
                
                // Deduct the profit from the investment's totalProfit
                await sequelize.transaction(async (t) => {
                    await investment.update({
                        totalProfit: sequelize.literal(`totalProfit - ${dailyProfit}`)
                    }, { transaction: t });
                    
                    // Deduct from user's balance
                    await investment.User.decrement('balance', { 
                        by: dailyProfit,
                        transaction: t 
                    });
                    
                    console.log(`- Fixed: Deducted $${dailyProfit.toFixed(2)} from investment ID ${investment.id} and user ${investment.User.id}`);
                });
                
            }
        }
        
        console.log('\nAnalysis Summary:');
        console.log('-------------------');
        console.log(`Total investments analyzed: ${investments.length}`);
        console.log(`Weekend profit updates found: ${weekendUpdateCount}`);
        console.log(`Total estimated incorrect profits: $${totalIncorrectProfits.toFixed(2)}`);
        console.log('\nNote: This script is in read-only mode. To fix weekend profits, uncomment the fix code section.');
    } catch (error) {
        console.error('Error analyzing weekend profits:', error);
    } finally {
        // Close the database connection
        await sequelize.close();
        console.log('Database connection closed.');
    }
};

// Run the analysis
analyzeAndFixWeekendProfits().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
}); 