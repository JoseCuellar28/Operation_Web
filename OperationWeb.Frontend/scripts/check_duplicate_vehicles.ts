
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

async function checkDuplicateVehicles() {
    let pool;
    try {
        pool = await sql.connect(config);

        console.log("🔍 Checking for Duplicate Vehicle Assignments for TODAY...");

        // Local Date
        const todayDate = new Date();
        const yyyy = todayDate.getFullYear();
        const mm = String(todayDate.getMonth() + 1).padStart(2, '0');
        const dd = String(todayDate.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;

        const result = await pool.query(`
            SELECT placa_vehiculo, COUNT(*) as usage_count
            FROM CUADRILLA_DIARIA 
            WHERE fecha_operacion = '${todayStr}' AND placa_vehiculo IS NOT NULL
            GROUP BY placa_vehiculo
            HAVING COUNT(*) > 1
        `);

        if (result.recordset.length > 0) {
            console.log("⚠️ DUPLICATES FOUND:");
            console.table(result.recordset);

            for (const row of result.recordset) {
                const plate = row.placa_vehiculo;
                console.log(`\nAnalyzing duplicates for plate: ${plate}`);

                const crews = await pool.query(`
                    SELECT id_cuadrilla, codigo, fecha_operacion
                    FROM CUADRILLA_DIARIA
                    WHERE fecha_operacion = '${todayStr}' AND placa_vehiculo = '${plate}'
                `);
                console.table(crews.recordset);
            }
        } else {
            console.log("✅ No duplicate vehicle assignments found for today.");
        }

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        if (pool) await pool.close();
    }
}

checkDuplicateVehicles();
