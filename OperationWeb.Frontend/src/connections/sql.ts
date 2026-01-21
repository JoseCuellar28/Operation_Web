import sql from 'mssql';
import fs from 'fs';
import path from 'path';

// Helper to load env vars in Node.js execution context (like scripts)
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

const config: sql.config = {
    user: env.DB_USER || process.env.DB_USER,
    password: env.DB_PASSWORD || process.env.DB_PASSWORD,
    server: env.DB_SERVER || process.env.DB_SERVER || 'localhost',
    port: parseInt(env.DB_PORT || process.env.DB_PORT || '1433'),
    database: env.DB_NAME || process.env.DB_NAME,
    options: {
        encrypt: env.DB_ENCRYPT === 'true', // for azure
        trustServerCertificate: env.DB_TRUST_CERT === 'false' ? false : true // default to true if check failed, but user said false? Wait.
        // User image said DB_TRUST_CERT=false. So I should respect that.
        // However, for self-signed or local dev, often needs true.
        // The user explicitly set it in .env, so I will read it.
    }
};

// If trust server cert is explicitly false in env, set it false. 
// Note: mssql default might rely on underlying driver. 
// "trustServerCertificate: true" is usually needed for local dev without valid certs.
// The user provided "false", so we stick to strict check unless it fails.
if (env.DB_TRUST_CERT === 'true') {
    config.options!.trustServerCertificate = true;
} else if (env.DB_TRUST_CERT === 'false') {
    config.options!.trustServerCertificate = false;
}

export const sqlConfig = config;

export async function getConnection() {
    try {
        const pool = await sql.connect(config);
        return pool;
    } catch (err) {
        console.error('SQL Connection Failed:', err);
        throw err;
    }
}

export { sql };
