/**
 * Date utility functions for profit calculations
 */

/**
 * Check if a date is a weekend (Saturday or Sunday)
 * @param {Date} date - The date to check
 * @returns {boolean} - True if the date is a weekend, false otherwise
 */
export const isWeekend = (date = new Date()) => {
    const day = date.getDay();
    // Saturday = 6, Sunday = 0
    return day === 0 || day === 6;
};

/**
 * Get the number of business days (Monday-Friday) between two dates, inclusive
 * @param {Date} startDate - The start date
 * @param {Date} endDate - The end date
 * @returns {number} - The number of business days
 */
export const getBusinessDaysBetweenDates = (startDate, endDate) => {
    let count = 0;
    const currentDate = new Date(startDate);
    
    // Loop through each day between the dates
    while (currentDate <= endDate) {
        // If it's not a weekend, count it
        if (!isWeekend(currentDate)) {
            count++;
        }
        // Move to the next day
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return count;
};

/**
 * Calculate the next business day from a given date
 * @param {Date} date - The starting date
 * @returns {Date} - The next business day
 */
export const getNextBusinessDay = (date = new Date()) => {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    
    // If the next day is a weekend, keep moving forward until it's not
    while (isWeekend(nextDay)) {
        nextDay.setDate(nextDay.getDate() + 1);
    }
    
    return nextDay;
}; 