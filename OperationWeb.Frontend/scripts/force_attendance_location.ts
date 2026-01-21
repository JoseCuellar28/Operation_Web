
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

async function forceLocationToday() {
    let pool;
    try {
        pool = await sql.connect(config);

        // Local Date
        const todayDate = new Date();
        const yyyy = todayDate.getFullYear();
        const mm = String(todayDate.getMonth() + 1).padStart(2, '0');
        const dd = String(todayDate.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`; // 2025-12-18

        console.log(`🌍 Forcing Location for Date: ${todayStr}`);

        const result = await pool.query(`
            UPDATE ASISTENCIA_DIARIA 
            SET 
                location_address = 'Av. Javier Prado Este 1234, San Borja, Lima',
                lat_checkin = -12.089,
                long_checkin = -77.005,
                metodo_verificacion = 'BATCH_FIX'
            WHERE fecha_asistencia = '${todayStr}'
        `);

        console.log(`✅ Updated ${result.rowsAffected[0]} records with location data.`);

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        if (pool) await pool.close();
    }
}

forceLocationToday();
