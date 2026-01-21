
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');

try {
    if (!fs.existsSync(envPath)) {
        console.error('❌ .env file does not exist');
        process.exit(1);
    }

    const envContent = fs.readFileSync(envPath, 'utf-8');
    const envVars: Record<string, string> = {};

    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            envVars[match[1].trim()] = match[2].trim();
        }
    });

    const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
    const missing = required.filter(key => !envVars[key]);

    if (missing.length > 0) {
        console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
        process.exit(1);
    }

    const url = envVars['VITE_SUPABASE_URL'];
    if (!url.startsWith('https://')) {
        console.error('❌ VITE_SUPABASE_URL does not start with https://');
    }

    console.log('✅ Environment variables are present.');

} catch (error) {
    console.error('Error reading .env:', error);
}
