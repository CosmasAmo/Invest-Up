import pkg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const { Pool } = pkg;

// Create PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

// SQL to create session table
const createTableSQL = `
CREATE TABLE IF NOT EXISTS "user_sessions" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "user_sessions" ("expire");
`;

async function initSessionTable() {
  let client;
  try {
    // Connect to the database
    client = await pool.connect();
    console.log('Connected to the database');
    
    // Create session table
    await client.query(createTableSQL);
    console.log('Session table created successfully');
    
    return true;
  } catch (err) {
    console.error('Error initializing session table:', err);
    return false;
  } finally {
    if (client) {
      client.release();
      console.log('Client connection released');
    }
    
    // Close the pool
    await pool.end();
    console.log('Pool ended');
  }
}

// Run the initialization
initSessionTable()
  .then(success => {
    if (success) {
      console.log('✅ Session table initialization completed successfully');
      process.exit(0);
    } else {
      console.error('❌ Session table initialization failed');
      process.exit(1);
    }
  }); 