import bcrypt from 'bcryptjs';
import User from './models/userModel.js';
import sequelize from './config/database.js';

async function updateAdmin() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully');

    // Email of an existing user to make admin
    const email = 'admin@investuptrading.com';
    
    // If you want to update an existing regular user to admin instead:
    // const email = 'existing_user@example.com'; 
    
    const password = 'Admin123456';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Find the user
    const user = await User.findOne({ where: { email } });
    
    if (user) {
      // Update the user
      await user.update({
        password: hashedPassword,
        isAdmin: true,
        isAccountVerified: true
      });
      
      console.log(`User ${email} updated successfully!`);
      console.log('New password:', password);
      console.log('Admin status:', true);
    } else {
      console.log(`User with email ${email} not found. Creating new admin user...`);
      
      // Create a new admin user
      const newUser = await User.create({
        name: 'Admin User',
        email,
        password: hashedPassword,
        isAccountVerified: true,
        isAdmin: true,
        referralCode: Math.random().toString(36).substring(7)
      });
      
      console.log(`New admin user created with ID: ${newUser.id}`);
      console.log('Email:', email);
      console.log('Password:', password);
    }
  } catch (error) {
    console.error('Error updating admin user:', error);
  } finally {
    await sequelize.close();
  }
}

updateAdmin(); 