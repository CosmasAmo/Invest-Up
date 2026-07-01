# Server Scripts

This directory contains utility scripts for maintaining and managing the application.

## Fix Weekend Profits Script

The `fixWeekendProfits.js` script helps identify and fix profits that were incorrectly calculated on weekends. By default, the script runs in read-only mode and will not make any changes to your database.

### Usage

1. **Analysis Mode (Default)**

   ```bash
   # From the server directory
   node scripts/fixWeekendProfits.js
   ```

   This will scan the last 30 days of profit updates and report on any that occurred on weekends. The script will output a summary showing:
   - Total investments analyzed
   - Weekend profit updates found
   - Total estimated incorrect profits

2. **Fix Mode**

   To actually fix the incorrect profits, edit the script and uncomment the fixing code section (look for the commented block that starts with `// Deduct the profit from...`).

   ```bash
   # After uncommenting the fix code
   node scripts/fixWeekendProfits.js
   ```

   This will:
   - Deduct the incorrect profits from each investment's total profit
   - Adjust the user's balance accordingly

### Customization

You can modify the `DAYS_TO_CHECK` constant in the script to change how far back the script looks for weekend profit calculations. The default is 30 days.

### Important Notes

- Always back up your database before running the script in fix mode
- The script uses the daily profit rate for each investment to estimate incorrect profits
- After running the fix, you may want to update the `lastProfitUpdate` timestamps to be on the most recent business day 