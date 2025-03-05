import validateEmail from './utils/emailValidator.js';

const testEmail = async () => {
  try {
    console.log('========== TESTING EMAIL VALIDATOR ==========');
    
    const testCases = [
      // Valid emails
      { email: 'johndoe123@gmail.com', description: 'Valid Gmail address' },
      { email: 'jane.smith@outlook.com', description: 'Valid Outlook address' },
      { email: 'robert.johnson1985@yahoo.com', description: 'Valid Yahoo address' },
      
      // Invalid format
      { email: 'testgmail.com', description: 'Missing @ symbol' },
      { email: 'test@', description: 'Missing domain' },
      { email: '@gmail.com', description: 'Missing username' },
      
      // Invalid TLDs
      { email: 'test@example.test', description: 'Invalid TLD (.test)' },
      { email: 'test@localhost', description: 'Invalid domain (localhost)' },
      
      // Disposable emails
      { email: 'test@mailinator.com', description: 'Disposable email provider' },
      { email: 'test@10minutemail.com', description: 'Disposable email provider' },
      
      // Non-existent domains
      { email: 'test@nonexistentdomain12345.com', description: 'Non-existent domain' },
      { email: 'test@thisisnotarealdomain987654321.com', description: 'Non-existent domain' },
      
      // Common provider with suspicious usernames
      { email: 'a@gmail.com', description: 'Gmail with too short username' },
      { email: 'ab@gmail.com', description: 'Gmail with too short username' },
      { email: 'abc@gmail.com', description: 'Gmail with too short username' },
      { email: 'abcde@gmail.com', description: 'Gmail with too short username' },
      { email: 'test@gmail.com', description: 'Gmail with suspicious username (test)' },
      { email: 'test123@gmail.com', description: 'Gmail with suspicious username (test123)' },
      { email: 'user@gmail.com', description: 'Gmail with suspicious username (user)' },
      { email: 'admin@gmail.com', description: 'Gmail with suspicious username (admin)' },
      { email: 'abc123@gmail.com', description: 'Gmail with suspicious username (abc123)' },
      { email: 'a1@gmail.com', description: 'Gmail with suspicious username (a1)' },
      { email: 'john12345@gmail.com', description: 'Gmail with suspicious username (too many sequential numbers)' },
      
      // Gmail-specific invalid formats
      { email: 'john@doe@gmail.com', description: 'Gmail with invalid characters' },
      { email: 'john*doe@gmail.com', description: 'Gmail with invalid characters' },
      { email: '.....@gmail.com', description: 'Gmail with only dots' },
      
      // Valid emails that should pass all checks
      { email: 'john.doe1234@gmail.com', description: 'Valid Gmail with good format' },
      { email: 'jane_smith85@yahoo.com', description: 'Valid Yahoo with good format' },
      { email: 'robert-johnson@outlook.com', description: 'Valid Outlook with good format' }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n----- Testing: ${testCase.description} -----`);
      console.log(`Email: ${testCase.email}`);
      
      const result = await validateEmail(testCase.email);
      
      console.log('Result:', result);
      console.log('Is valid:', result.isValid);
      console.log('Message:', result.message);
    }
    
    console.log('\n========== EMAIL VALIDATOR TESTING COMPLETE ==========');
    
  } catch (error) {
    console.error('Error testing email validator:', error);
  }
};

// Run the tests
testEmail(); 