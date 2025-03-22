/**
 * Simplified email validator that only checks for the presence of '@'
 * 
 * @param {string} email - The email address to validate
 * @returns {Promise<{isValid: boolean, message: string}>} - Validation result
 */
export const validateEmail = async (email) => {
    console.log(`Validating email: ${email}`);
    
    // Check if email is provided
    if (!email) {
        return { 
            isValid: false, 
            message: 'Email address is required' 
        };
    }
    
    // Check if email contains @ symbol
    if (!email.includes('@')) {
        console.log(`Email missing @ symbol: ${email}`);
        return { 
            isValid: false, 
            message: 'Email address must contain an @ symbol' 
        };
    }

    // Return valid if it passes the basic check
    return { 
        isValid: true, 
        message: 'Email is valid' 
    };
};

export default validateEmail; 