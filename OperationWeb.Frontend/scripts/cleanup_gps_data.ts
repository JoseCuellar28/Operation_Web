
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

async function cleanupTestGPS() {
    let pool;
    try {
        pool = await sql.connect(config);

        console.log("🧹 Cleaning up Test GPS Data...");

        // 1. Get Active Plates Today
        const activeRes = await pool.query(`
            SELECT DISTINCT placa_vehiculo 
            FROM CUADRILLA_DIARIA 
            WHERE fecha_operacion = CAST(GETDATE() AS DATE) 
            AND placa_vehiculo IS NOT NULL
        `);

        const activePlates = activeRes.recordset.map((r: any) => r.placa_vehiculo);
        console.log(`📋 Keeping Data for Active Vehicles: ${activePlates.join(', ')}`);

        if (activePlates.length === 0) {
            console.log("⚠️ No active vehicles found. Aborting cleanup to prevent total wipe.");
            return;
        }

        // 2. Delete GPS Logs for NON-Active Plates
        // We construct the NOT IN clause manually or use a parameter if possible, but list is short.
        const placeholders = activePlates.map((p: string) => `'${p}'`).join(',');

        const deleteRes = await pool.query(`
            DELETE FROM VEHICLE_TRACKING_LOGS 
            WHERE placa NOT IN (${placeholders})
        `);

        console.log(`🗑️  Deleted ${deleteRes.rowsAffected[0]} GPS logs for non-active/test vehicles.`);

        // 3. Delete explicit 'TEST' vehicles from Master if they exist and are not active
        const deleteTestVeh = await pool.query(`
            DELETE FROM VEHICULOS 
            WHERE placa LIKE 'TEST%' 
            AND placa NOT IN (${placeholders})
        `);

        console.log(`🗑️  Deleted ${deleteTestVeh.rowsAffected[0]} dummy 'TEST' vehicles from master table.`);

        console.log("✅ Cleanup Complete. Map should show ONLY active crews.");

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        if (pool) await pool.close();
    }
}

cleanupTestGPS();
