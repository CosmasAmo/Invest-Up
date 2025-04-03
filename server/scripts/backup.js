import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backupDir = path.join(__dirname, '../backups');

// Create backup directory if it doesn't exist
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Get current date for backup file naming
const now = new Date();
const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;

// PostgreSQL connection details from environment variables
const dbUrl = process.env.POSTGRES_URL || '';

// Parse connection string
let dbHost, dbUser, dbPassword, dbName, dbPort;

try {
  if (dbUrl) {
    const match = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):?(\d*)\/([^?]+)/);
    if (match) {
      dbUser = match[1];
      dbPassword = match[2];
      dbHost = match[3];
      dbPort = match[4] || '5432';
      dbName = match[5];
    }
  } else {
    dbUser = process.env.DB_USER;
    dbPassword = process.env.DB_PASSWORD;
    dbHost = process.env.DB_HOST;
    dbPort = '5432';
    dbName = process.env.DB_NAME;
  }
  
  if (!dbUser || !dbHost || !dbName) {
    throw new Error('Missing database connection details');
  }

  // Backup database
  console.log('Creating database backup...');
  const dbBackupFile = path.join(backupDir, `db_backup_${timestamp}.sql`);
  
  // Create pg_dump command
  const pgDumpCmd = `PGPASSWORD="${dbPassword}" pg_dump -h ${dbHost} -U ${dbUser} -p ${dbPort} -d ${dbName} -f "${dbBackupFile}" --verbose`;
  
  exec(pgDumpCmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Database backup error: ${error.message}`);
      return;
    }
    console.log(`Database backup created successfully: ${dbBackupFile}`);
    
    // Create a backup of .env files
    const envBackupFile = path.join(backupDir, `env_backup_${timestamp}.tar.gz`);
    const envBackupCmd = `tar -czf "${envBackupFile}" "${path.join(__dirname, '../.env')}" "${path.join(__dirname, '../../client/.env')}"`;
    
    exec(envBackupCmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`Environment backup error: ${error.message}`);
        return;
      }
      console.log(`Environment files backup created: ${envBackupFile}`);
      
      // List all backups
      console.log('\nAvailable backups:');
      fs.readdirSync(backupDir).forEach(file => {
        const stats = fs.statSync(path.join(backupDir, file));
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        console.log(`${file} (${fileSizeMB} MB) - ${stats.mtime}`);
      });
    });
  });
} catch (error) {
  console.error('Backup error:', error.message);
} 