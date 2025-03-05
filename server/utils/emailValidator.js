import emailValidator from 'email-validator';
import dns from 'dns';
import { promisify } from 'util';
import net from 'net';

// Convert callback-based DNS functions to Promise-based
const resolveMx = promisify(dns.resolveMx);

// Set DNS timeout to prevent hanging
dns.setServers([
  '8.8.8.8',  // Google DNS
  '1.1.1.1',  // Cloudflare DNS
  '208.67.222.222' // OpenDNS
]);

/**
 * Validates an email address by checking:
 * 1. If it has valid format
 * 2. If the domain exists and has MX records
 * 3. If it's not from a disposable email provider
 * 4. Attempts SMTP verification when possible
 * 5. For Gmail addresses, performs additional validation
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
    
    // Check basic email format
    if (!emailValidator.validate(email)) {
        console.log(`Email format invalid: ${email}`);
        return { 
            isValid: false, 
            message: 'Please enter a valid email address format (example@domain.com)' 
        };
    }

    // Extract domain and username from email
    const [username, domain] = email.split('@');
    const lowerDomain = domain.toLowerCase();
    console.log(`Checking domain: ${lowerDomain}, username: ${username}`);

    // Basic username validation
    if (username.length < 3) {
        console.log(`Username too short: ${username}`);
        return {
            isValid: false,
            message: 'Email username is too short. Most email providers require at least 3 characters.'
        };
    }

    // Check for invalid TLDs
    const invalidTLDs = ['.test', '.example', '.invalid', '.localhost'];
    if (invalidTLDs.some(tld => lowerDomain.endsWith(tld))) {
        console.log(`Domain ${lowerDomain} has an invalid TLD`);
        return {
            isValid: false,
            message: 'This email domain is not valid for registration. Please use a real email address.'
        };
    }

    // Gmail-specific validation (more strict)
    if (lowerDomain === 'gmail.com' || lowerDomain === 'googlemail.com') {
        console.log(`Domain ${lowerDomain} is Gmail, performing strict validation`);
        
        // Gmail doesn't allow usernames shorter than 6 characters
        if (username.length < 6) {
            console.log(`Gmail username too short: ${username}`);
            return {
                isValid: false,
                message: 'Gmail addresses must be at least 6 characters long. Please use a valid Gmail address.'
            };
        }
        
        // Gmail doesn't allow certain special characters
        if (/[^a-zA-Z0-9.+_-]/.test(username)) {
            console.log(`Gmail username contains invalid characters: ${username}`);
            return {
                isValid: false,
                message: 'Gmail addresses can only contain letters, numbers, periods, plus signs, underscores, and hyphens.'
            };
        }
        
        // Gmail ignores dots, so a username with all dots is invalid
        if (username.replace(/\./g, '').length === 0) {
            console.log(`Gmail username contains only dots: ${username}`);
            return {
                isValid: false,
                message: 'This Gmail address format is invalid. Please use a valid Gmail address.'
            };
        }
        
        // Check for common patterns of fake Gmail addresses
        const suspiciousGmailPatterns = [
            /^test\d*$/i,                // test, test123
            /^user\d*$/i,                // user, user123
            /^admin\d*$/i,               // admin, admin123
            /^[a-z]{1,3}\d{1,3}$/i,      // ab1, xyz123
            /^temp\d*$/i,                // temp, temp123
            /^fake\d*$/i,                // fake, fake123
            /^dummy\d*$/i,               // dummy, dummy123
            /^sample\d*$/i,              // sample, sample123
            /^[a-z]+[0-9]{4,}$/i,        // john12345 (too many sequential numbers)
            /^[a-z]{1,2}[0-9]{1,2}$/i,   // a1, b2, xy12
            /^(abc|xyz|qwe|asd|zxc)\d*$/i, // Common keyboard patterns
            /^[a-z]+test\d*$/i,          // johntest, marytest123
            /^random\d*$/i,              // random, random123
            /^anonymous\d*$/i,           // anonymous, anonymous123
            /^noreply\d*$/i,             // noreply, noreply123
            /^[a-z]{6,8}$/i,             // Simple 6-8 character usernames without numbers
            /^[a-z]{3,5}[0-9]{3,5}$/i    // Simple pattern of few letters followed by numbers
        ];
        
        if (suspiciousGmailPatterns.some(pattern => pattern.test(username))) {
            console.log(`Gmail username matches suspicious pattern: ${username}`);
            return {
                isValid: false,
                message: 'This Gmail address appears to be invalid or suspicious. Please use your real Gmail address.'
            };
        }
        
        // Check for random-looking usernames (high entropy)
        const hasHighEntropy = (str) => {
            // Calculate entropy by checking for randomness in character distribution
            const charTypes = {
                lowerAlpha: /[a-z]/,
                upperAlpha: /[A-Z]/,
                numeric: /[0-9]/,
                special: /[.+_-]/
            };
            
            let typeCount = 0;
            for (const type in charTypes) {
                if (charTypes[type].test(str)) {
                    typeCount++;
                }
            }
            
            // Check for random distribution of characters
            const charCounts = {};
            for (const char of str) {
                charCounts[char] = (charCounts[char] || 0) + 1;
            }
            
            const uniqueChars = Object.keys(charCounts).length;
            const avgRepetition = str.length / uniqueChars;
            
            // If username has high entropy (looks random) and is not a common pattern
            return typeCount >= 3 && uniqueChars > 5 && avgRepetition < 1.5;
        };
        
        // Check for random-looking Gmail addresses that are likely fake
        if (hasHighEntropy(username) && username.length >= 8 && /\d{3,}/.test(username)) {
            console.log(`Gmail username appears random: ${username}`);
            return {
                isValid: false,
                message: 'This Gmail address appears to be randomly generated. Please use your real email address.'
            };
        }
        
        // Verify MX records exist for Gmail (should always be true, but check anyway)
        const mxResult = await verifyMxRecords(lowerDomain);
        if (!mxResult.isValid) {
            return mxResult;
        }
        
        // For Gmail, we can't do SMTP verification as Google blocks it
        // But we've done extensive pattern checking above
        return { 
            isValid: true, 
            message: 'Email is valid' 
        };
    }

    // For other common email providers, do basic validation
    const commonDomains = [
        'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 
        'aol.com', 'protonmail.com', 'mail.com', 'zoho.com', 'yandex.com', 
        'gmx.com', 'live.com', 'msn.com', 'me.com', 'mac.com'
    ];
    
    if (commonDomains.includes(lowerDomain)) {
        console.log(`Domain ${lowerDomain} is a common provider, performing additional username checks`);
        
        // Check for common username patterns that are unlikely to be valid
        const suspiciousPatterns = [
            /^[a-z]{1,2}$/i, // Too short (1-2 chars)
            /^test\d*$/i, // test, test1, test123
            /^user\d*$/i, // user, user1, user123
            /^admin\d*$/i, // admin, admin1, admin123
            /^[a-z]{1,3}\d{1,3}$/i, // Short combos like ab1, xyz123
            /^(abc|xyz|qwe|asd|zxc)\d*$/i, // Common keyboard patterns
            /^[a-z]+[0-9]{4,}$/i, // Like john12345 (too many sequential numbers)
            /^[a-z]{1,2}[0-9]{1,2}$/i // Very short like a1, b2, xy12
        ];
        
        if (suspiciousPatterns.some(pattern => pattern.test(username.toLowerCase()))) {
            console.log(`Username matches suspicious pattern: ${username}`);
            return {
                isValid: false,
                message: 'This email address appears to be invalid or suspicious. Please use your real email address.'
            };
        }
        
        // For common domains, we'll still verify MX records exist
        const mxResult = await verifyMxRecords(lowerDomain);
        if (!mxResult.isValid) {
            return mxResult;
        }
        
        return { 
            isValid: true, 
            message: 'Email is valid' 
        };
    }

    // Check for disposable email domains - expanded list
    const disposableDomains = [
        'mailinator.com', 'tempmail.com', 'temp-mail.org', 'fakeinbox.com', 
        'guerrillamail.com', '10minutemail.com', 'yopmail.com', 'trashmail.com',
        'throwawaymail.com', 'sharklasers.com', 'getairmail.com', 'mailnesia.com',
        'tempr.email', 'dispostable.com', 'maildrop.cc', 'getnada.com',
        'emailondeck.com', 'spamgourmet.com', 'mailcatch.com', 'tempmailaddress.com',
        'tempail.com', 'temp-mail.ru', 'minutemail.com', 'tempinbox.com',
        'emailfake.com', 'tempmailer.com', 'mailexpire.com', 'tempemail.net',
        'fakemail.net', 'mytemp.email', 'burnermail.io', 'temp-mail.io'
    ];
    
    if (disposableDomains.includes(lowerDomain)) {
        console.log(`Domain ${lowerDomain} is a disposable email provider`);
        return { 
            isValid: false, 
            message: 'Disposable email addresses are not allowed. Please use your regular email address.' 
        };
    }

    // Verify MX records exist for the domain
    const mxResult = await verifyMxRecords(lowerDomain);
    if (!mxResult.isValid) {
        return mxResult;
    }
    
    // For non-common domains, attempt SMTP verification
    const smtpResult = await verifyEmailExistenceViaSMTP(email, lowerDomain, mxResult.mxRecords);
    if (!smtpResult.isValid) {
        return smtpResult;
    }
    
    return { 
        isValid: true, 
        message: 'Email is valid' 
    };
};

/**
 * Verifies that a domain has valid MX records
 * @param {string} domain - The domain to check
 * @returns {Promise<{isValid: boolean, message: string, mxRecords?: any[]}>}
 */
const verifyMxRecords = async (domain) => {
    return new Promise(async (resolve) => {
        // Set a timeout of 5 seconds
        const timeoutId = setTimeout(() => {
            console.log(`DNS lookup timeout for domain: ${domain}`);
            resolve({ 
                isValid: false, 
                message: 'Email validation timed out. The domain appears to be invalid or cannot be verified.' 
            });
        }, 5000);
        
        try {
            console.log(`Resolving MX records for: ${domain}`);
            const mxRecords = await resolveMx(domain);
            clearTimeout(timeoutId);
            
            console.log(`MX records found: ${JSON.stringify(mxRecords)}`);
            
            if (!mxRecords || mxRecords.length === 0) {
                console.log(`No MX records found for domain: ${domain}`);
                resolve({ 
                    isValid: false, 
                    message: 'This email domain does not have mail servers. Please use a valid email address.' 
                });
            } else {
                resolve({ 
                    isValid: true, 
                    message: 'Domain has valid mail servers',
                    mxRecords
                });
            }
        } catch (error) {
            clearTimeout(timeoutId);
            // If DNS lookup fails, the domain likely doesn't exist
            console.log(`DNS lookup failed for domain: ${domain}`, error);
            resolve({ 
                isValid: false, 
                message: 'This email address appears to be invalid. The domain does not exist or cannot be verified.' 
            });
        }
    });
};

/**
 * Attempts to verify email existence via SMTP connection
 * This is a lightweight check that doesn't actually send email
 * @param {string} email - Full email address
 * @param {string} domain - Domain part of the email
 * @param {Array} mxRecords - MX records for the domain
 * @returns {Promise<{isValid: boolean, message: string}>}
 */
const verifyEmailExistenceViaSMTP = async (email, domain, mxRecords) => {
    // Skip SMTP verification for some domains that block these checks
    const skipSmtpVerification = [
        'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 
        'aol.com', 'protonmail.com', 'googlemail.com'
    ];
    
    if (skipSmtpVerification.includes(domain)) {
        return { isValid: true, message: 'Email domain is valid' };
    }
    
    if (!mxRecords || mxRecords.length === 0) {
        return { isValid: false, message: 'No mail servers found for this domain' };
    }
    
    // Sort MX records by priority (lowest first)
    const sortedMxRecords = [...mxRecords].sort((a, b) => a.priority - b.priority);
    const mailServer = sortedMxRecords[0].exchange;
    
    return new Promise((resolve) => {
        const socket = new net.Socket();
        let responseBuffer = '';
        let hasError = false;
        
        // Set timeout to 10 seconds
        socket.setTimeout(10000);
        
        socket.on('timeout', () => {
            console.log(`SMTP connection timeout for ${mailServer}`);
            socket.destroy();
            resolve({ 
                isValid: false, 
                message: 'Email verification timed out. Please try a different email address.' 
            });
        });
        
        socket.on('error', (err) => {
            console.log(`SMTP connection error for ${mailServer}:`, err.message);
            hasError = true;
            resolve({ 
                isValid: true,  // Still mark as valid since we can't be sure
                message: 'Email domain exists but could not verify the specific address' 
            });
        });
        
        socket.on('data', (data) => {
            responseBuffer += data.toString();
            
            // Only proceed if we get a response and haven't had an error
            if (responseBuffer.includes('220') && !hasError) {
                // Send HELO command
                socket.write(`HELO example.com\r\n`);
                
                // After HELO, check if we can send MAIL FROM
                if (responseBuffer.includes('250') && responseBuffer.includes('HELO')) {
                    socket.write(`MAIL FROM: <verify@example.com>\r\n`);
                    
                    // After MAIL FROM, check if we can send RCPT TO
                    if (responseBuffer.includes('250') && responseBuffer.includes('MAIL FROM')) {
                        socket.write(`RCPT TO: <${email}>\r\n`);
                        
                        // Check the response to RCPT TO
                        if (responseBuffer.includes('RCPT TO')) {
                            // If we get a 250 response, the email exists
                            if (responseBuffer.includes('250')) {
                                socket.write(`QUIT\r\n`);
                                socket.end();
                                resolve({ 
                                    isValid: true, 
                                    message: 'Email address exists' 
                                });
                            } 
                            // If we get a 550 response, the email doesn't exist
                            else if (responseBuffer.includes('550') || 
                                     responseBuffer.includes('553') || 
                                     responseBuffer.includes('501') || 
                                     responseBuffer.includes('504')) {
                                socket.write(`QUIT\r\n`);
                                socket.end();
                                resolve({ 
                                    isValid: false, 
                                    message: 'This email address does not exist. Please use a valid email address.' 
                                });
                            } 
                            // For any other response, we can't be sure
                            else {
                                socket.write(`QUIT\r\n`);
                                socket.end();
                                resolve({ 
                                    isValid: true,  // Mark as valid since we can't be sure
                                    message: 'Email domain exists but could not verify the specific address' 
                                });
                            }
                        }
                    }
                }
            }
        });
        
        socket.on('close', () => {
            if (responseBuffer === '') {
                resolve({ 
                    isValid: true,  // Mark as valid since we can't be sure
                    message: 'Email domain exists but could not verify the specific address' 
                });
            }
        });
        
        // Connect to the mail server
        try {
            console.log(`Attempting SMTP connection to ${mailServer}`);
            socket.connect(25, mailServer);
        } catch (err) {
            console.log(`Failed to initiate SMTP connection:`, err);
            resolve({ 
                isValid: true,  // Mark as valid since we can't be sure
                message: 'Email domain exists but could not verify the specific address' 
            });
        }
    });
};

export default validateEmail; 