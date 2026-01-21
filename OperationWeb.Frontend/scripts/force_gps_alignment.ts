
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

const BASE_LAT = -12.0464;
const BASE_LNG = -77.0428;

async function forceGPSAlignment() {
    let pool;
    try {
        pool = await sql.connect(config);

        console.log("📡 Aligning GPS Telemetry for Active Crews (Retry)...");

        // 1. Get Active Plates Today
        const result = await pool.query(`
            SELECT DISTINCT placa_vehiculo 
            FROM CUADRILLA_DIARIA 
            WHERE fecha_operacion = CAST(GETDATE() AS DATE) 
            AND placa_vehiculo IS NOT NULL
        `);

        const activePlates = result.recordset.map((r: any) => r.placa_vehiculo);
        console.log(`📋 Found ${activePlates.length} active vehicles: ${activePlates.join(', ')}`);

        if (activePlates.length === 0) {
            console.log("⚠️ No active vehicles found to update.");
            return;
        }

        // 2. Insert new "Live" logs using CORRECT SCHEMA
        // Columns: placa, lat, lng, speed, heading, timestamp, event_type
        let count = 0;
        for (const plate of activePlates) {
            // Random offset for visual separation
            const latOffset = (Math.random() - 0.5) * 0.05;
            const lngOffset = (Math.random() - 0.5) * 0.05;

            await pool.request()
                .input('placa', sql.NVarChar, plate)
                .input('lat', sql.Decimal(10, 6), BASE_LAT + latOffset)
                .input('lng', sql.Decimal(10, 6), BASE_LNG + lngOffset)
                .query(`
                    INSERT INTO VEHICLE_TRACKING_LOGS (
                        placa, lat, lng, speed, heading, timestamp, event_type
                    ) VALUES (
                        @placa, @lat, @lng, 35, 90, GETDATE(), 'IG_ON'
                    )
                `);
            count++;
        }

        console.log(`✅ Telemetry updated. Injected ${count} live coordinates.`);

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        if (pool) await pool.close();
    }
}

forceGPSAlignment();
