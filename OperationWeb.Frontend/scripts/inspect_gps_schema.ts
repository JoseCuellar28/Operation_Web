
import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'M1Password123!',
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'OperationsSmartDB',
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
};

async function inspectGPSTable() {
    let pool;
    try {
        pool = await sql.connect(config);

        console.log("🔍 Inspecting VEHICLE_TRACKING_LOGS Schema...");

        const columns = await pool.query(`
            SELECT COLUMN_NAME, DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'VEHICLE_TRACKING_LOGS'
        `);
        console.table(columns.recordset);

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        if (pool) await pool.close();
    }
}

inspectGPSTable();
