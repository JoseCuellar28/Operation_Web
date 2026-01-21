
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

// Center of Lima/Operations
const BASE_LAT = -12.089;
const BASE_LNG = -77.005;

async function forceLocationRandom() {
    let pool;
    try {
        pool = await sql.connect(config);

        console.log("🌍 Updating Attendance with RANDOMIZED Locations...");

        // 1. Get all records for today (18th) OR yesterday (17th) to cover user observation
        // Actually, let's just update ALL records that don't have location or for the test dates.
        // The user mentioned 17 and 18.
        const records = await pool.query(`
            SELECT id_registro, id_colaborador 
            FROM ASISTENCIA_DIARIA 
            WHERE fecha_asistencia IN ('2025-12-17', '2025-12-18')
        `);

        console.log(`Found ${records.recordset.length} records to update.`);

        let count = 0;
        for (const rec of records.recordset) {
            // Generate random offset (approx 500m - 1km radius)
            const latOffset = (Math.random() - 0.5) * 0.02;
            const lngOffset = (Math.random() - 0.5) * 0.02;

            const newLat = BASE_LAT + latOffset;
            const newLng = BASE_LNG + lngOffset;

            // Update individually
            await pool.request()
                .input('id', sql.VarChar, rec.id_registro)
                .input('lat', sql.Decimal(10, 6), newLat)
                .input('lng', sql.Decimal(10, 6), newLng)
                .query(`
                    UPDATE ASISTENCIA_DIARIA 
                    SET 
                        location_address = 'Ubicación Simulada ' + CAST(ABS(CHECKSUM(NEWID()) % 100) AS VARCHAR),
                        lat_checkin = @lat,
                        long_checkin = @lng
                    WHERE id_registro = @id
                `);
            count++;
        }

        console.log(`✅ Successfully updated ${count} records with distinct locations.`);

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        if (pool) await pool.close();
    }
}

forceLocationRandom();
