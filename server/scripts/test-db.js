import sequelize from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('Database connection details:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Using connection string:', process.env.NODE_ENV === 'production' ? 'POSTGRES_URL' : 'POSTGRES_URI');

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    
    // Fetch a list of all tables
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('\nDatabase tables:');
    if (results.length === 0) {
      console.log('No tables found in the database.');
    } else {
      results.forEach(row => {
        console.log(`- ${row.table_name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

testConnection(); 