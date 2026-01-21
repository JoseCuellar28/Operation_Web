
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

async function checkDateMismatch() {
    let pool;
    try {
        pool = await sql.connect(config);

        console.log("🕒 TIME DIAGNOSTIC");
        console.log("--------------------------------------------------");

        // 1. Node.js Time
        const nodeISO = new Date().toISOString().split('T')[0];
        const nodeLocal = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local
        console.log(`Node.js (UTC ISO):   ${nodeISO}`);
        console.log(`Node.js (Local):     ${nodeLocal} (System Time)`);

        // 2. DB Time
        const dbRes = await pool.query("SELECT CAST(GETDATE() AS DATE) as db_date, GETDATE() as db_datetime");
        const dbDate = dbRes.recordset[0].db_date.toISOString().split('T')[0];
        console.log(`DB Server (GETDATE): ${dbDate}`);

        // 3. Crew Dates
        const crewRes = await pool.query("SELECT TOP 1 fecha_operacion FROM CUADRILLA_DIARIA WHERE placa_vehiculo = 'ABC-123' ORDER BY fecha_operacion DESC");
        if (crewRes.recordset.length > 0) {
            console.log(`Crew 'ABC-123' Date: ${crewRes.recordset[0].fecha_operacion.toISOString().split('T')[0]}`);
        } else {
            console.log(`Crew 'ABC-123' NOT FOUND`);
        }

        console.log("--------------------------------------------------");

        if (nodeISO !== dbDate) {
            console.log("⚠️ CRITICAL MISMATCH DETECTED: Node.js is using UTC Tomorrow, but DB is on Local Today.");
        } else {
            console.log("✅ Dates match.");
        }

    } catch (err) {
        console.error(err);
    } finally {
        if (pool) await pool.close();
    }
}

checkDateMismatch();
