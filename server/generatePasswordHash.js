import bcrypt from 'bcryptjs';

// The password to hash (using a simpler password without special characters)
const password = 'Admin123456';

// Generate hash
async function generateHash() {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Original Password:', password);
    console.log('Bcrypt Hash:', hashedPassword);
  } catch (error) {
    console.error('Error generating hash:', error);
  }
}

generateHash(); 