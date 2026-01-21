import sql from 'mssql';
import fs from 'fs';
import path from 'path';

// Load env vars manually
function loadEnv() {
    const env: Record<string, string> = {};
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf-8');
            envContent.split('\n').forEach(line => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    const value = match[2].trim().replace(/^['"](.*)['"]$/, '$1');
                    env[key] = value;
                }
            });
        }
    } catch (e) {
        console.warn('Could not load .env file manually');
    }
    return env;
}

const env = loadEnv();

// Config for connecting to master to create new DB
const config: sql.config = {
    user: env.DB_USER || 'sa',
    password: env.DB_PASSWORD,
    server: env.DB_SERVER || 'localhost',
    port: parseInt(env.DB_PORT || '1433'),
    database: 'master', // Connect to master first
    options: {
        encrypt: env.DB_ENCRYPT === 'true',
        trustServerCertificate: true // Always true for setup script to ensure it runs
    }
};

async function createDatabase() {
    console.log('Connecting to SQL Server (master)...');
    try {
        const pool = await sql.connect(config);
        console.log('Connected.');

        const newDbName = 'Opera_Main';

        // Check if DB exists
        const checkResult = await pool.request().query(`SELECT name FROM sys.databases WHERE name = '${newDbName}'`);

        if (checkResult.recordset.length > 0) {
            console.log(`Database "${newDbName}" already exists.`);
        } else {
            console.log(`Creating database "${newDbName}"...`);
            await pool.request().query(`CREATE DATABASE ${newDbName}`);
            console.log(`✅ Database "${newDbName}" created successfully.`);
        }

        await pool.close();
    } catch (err) {
        console.error('Failed to create database:', err);
        process.exit(1);
    }
}

createDatabase();
