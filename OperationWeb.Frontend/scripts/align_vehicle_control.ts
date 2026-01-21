
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

async function alignVehicleControl() {
    let pool;
    try {
        pool = await sql.connect(config);

        console.log("🧹 Aligning Vehicle Control (REGISTRO_VEHICULAR) with Active Crews...");

        const todayStr = new Date().toISOString().split('T')[0];

        // 1. Get Active Plates for Today
        const activeCrews = await pool.query(`
            SELECT DISTINCT placa_vehiculo 
            FROM CUADRILLA_DIARIA 
            WHERE fecha_operacion = '${todayStr}' 
            AND placa_vehiculo IS NOT NULL
        `);

        const activePlates = activeCrews.recordset.map((r: any) => r.placa_vehiculo);
        console.log(`\n📋 Active Plates Today: ${activePlates.join(', ')}`);

        if (activePlates.length === 0) {
            console.log("⚠️ No active crews found. Skipping cleanup to avoid deleting everything.");
            return;
        }

        // 2. Delete Trash (Records in REGISTRO_VEHICULAR not in activePlates) for Today
        // Using batch deletion
        const placeholders = activePlates.map((p: string) => `'${p}'`).join(',');

        const deleteRes = await pool.query(`
            DELETE FROM REGISTRO_VEHICULAR 
            WHERE CAST(fecha_registro AS DATE) = '${todayStr}'
            AND placa NOT IN (${placeholders})
        `);

        console.log(`\n🗑️  Deleted ${deleteRes.rowsAffected[0]} records of non-active vehicles.`);

        // 3. Verify Alignment
        const remaining = await pool.query(`
            SELECT placa, fecha_registro, conductor 
            FROM REGISTRO_VEHICULAR 
            WHERE CAST(fecha_registro AS DATE) = '${todayStr}'
        `);

        console.log("\n✅ Current Vehicle Control Records:");
        console.table(remaining.recordset);

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        if (pool) await pool.close();
    }
}

alignVehicleControl();
