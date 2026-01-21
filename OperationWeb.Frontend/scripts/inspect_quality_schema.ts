
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

async function inspectQualityTables() {
    let pool;
    try {
        pool = await sql.connect(config);

        console.log("🔍 Inspecting ORDENES_TRABAJO...");
        const otCols = await pool.query(`SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'ORDENES_TRABAJO'`);
        console.table(otCols.recordset);

        console.log("\n🔍 Inspecting EVIDENCIAS...");
        const evCols = await pool.query(`SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'EVIDENCIAS'`);
        console.table(evCols.recordset);

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        if (pool) await pool.close();
    }
}

inspectQualityTables();
