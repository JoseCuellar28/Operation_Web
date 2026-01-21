
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

async function injectViolations() {
    let pool;
    try {
        pool = await sql.connect(config);

        console.log("😈 Injecting Traffic Violations (Speed & Geofence)...");

        // 1. Get Active Plates Today
        const result = await pool.query(`
            SELECT DISTINCT placa_vehiculo, codigo 
            FROM CUADRILLA_DIARIA 
            WHERE fecha_operacion = CAST(GETDATE() AS DATE) 
            AND placa_vehiculo IS NOT NULL
        `);

        const crews = result.recordset;
        if (crews.length < 2) {
            console.log("⚠️ Need at least 2 active crews to simulate comparison. Found:", crews.length);
        }

        // 2. Select Victims (Bad Drivers)
        // Victim 1: The Speed Demon
        const speedDemon = crews[0]?.placa_vehiculo;
        if (speedDemon) {
            console.log(`🏎️  Simulating Speeding for ${speedDemon}...`);
            // Insert 5 speeding events in the last hour
            for (let i = 0; i < 5; i++) {
                await pool.request()
                    .input('placa', sql.NVarChar, speedDemon)
                    .input('lat', sql.Decimal(10, 6), BASE_LAT + (Math.random() * 0.01))
                    .input('lng', sql.Decimal(10, 6), BASE_LNG + (Math.random() * 0.01))
                    .input('speed', sql.Int, 110 + Math.floor(Math.random() * 20)) // 110-130 km/h
                    .query(`
                        INSERT INTO VEHICLE_TRACKING_LOGS (placa, lat, lng, speed, heading, timestamp, event_type)
                        VALUES (@placa, @lat, @lng, @speed, 45, DATEADD(minute, -${i * 10}, GETDATE()), 'SPEEDING')
                    `);
            }
        }

        // Victim 2: The Explorer (Geofence Violator)
        const explorer = crews[1]?.placa_vehiculo;
        if (explorer) {
            console.log(`🚧 Simulating Geofence Exits for ${explorer}...`);
            // Insert 3 geofence exit events
            for (let i = 0; i < 3; i++) {
                await pool.request()
                    .input('placa', sql.NVarChar, explorer)
                    .input('lat', sql.Decimal(10, 6), BASE_LAT + 0.5) // Far away
                    .input('lng', sql.Decimal(10, 6), BASE_LNG + 0.5) // Far away
                    .query(`
                        INSERT INTO VEHICLE_TRACKING_LOGS (placa, lat, lng, speed, heading, timestamp, event_type)
                        VALUES (@placa, @lat, @lng, 45, 180, DATEADD(minute, -${i * 15}, GETDATE()), 'GEOFENCE_EXIT')
                    `);
            }
        }

        console.log("✅ Violations Injected.");
        console.log(`   - ${speedDemon || 'N/A'}: 5 Speeding Events`);
        console.log(`   - ${explorer || 'N/A'}: 3 Geofence Exits`);

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        if (pool) await pool.close();
    }
}

injectViolations();
