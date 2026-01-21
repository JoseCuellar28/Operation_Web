import { getConnection } from '../src/connections/sql';

async function check() {
    console.log('Testing SQL Server Connection...');
    try {
        const pool = await getConnection();
        console.log('✅ Connected to SQL Server successfully!');

        // Try a simple query
        const result = await pool.request().query('SELECT @@VERSION as version');
        console.log('Server Version:', result.recordset[0].version);

        await pool.close();
    } catch (error) {
        console.error('❌ Connection failed:', error);
        process.exit(1);
    }
}

check();
