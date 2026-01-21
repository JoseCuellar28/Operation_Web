
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

async function inspectVehicleRegistry() {
    let pool;
    try {
        pool = await sql.connect(config);

        console.log("🔍 Inspecting REGISTRO_VEHICULAR Schema...");

        // 1. Get Columns
        const columns = await pool.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'REGISTRO_VEHICULAR'
        `);
        console.table(columns.recordset);

        // 2. See content for today
        const todayStr = new Date().toISOString().split('T')[0];
        console.log(`\n📅 Records for Today (${todayStr}):`);

        // Assuming there is a date column, guessing 'fecha_registro' or similar based on pattern.
        // I'll grab TOP 5 to see columns if step 1 fails or just to verify data.
        const preview = await pool.query("SELECT TOP 5 * FROM REGISTRO_VEHICULAR ORDER BY fecha_inspeccion DESC");
        console.table(preview.recordset);

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        if (pool) await pool.close();
    }
}

inspectVehicleRegistry();
