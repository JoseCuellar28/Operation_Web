
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

async function fixDuplicateVehicles() {
    let pool;
    try {
        pool = await sql.connect(config);

        console.log("🔧 Fixing Duplicate Vehicle Assignments...");

        // 1. Identify the duplicate (we know it's ABC-123 for C-103 and C-101)
        // We will keep C-101 with ABC-123 and move C-103.
        const crewToMove = '391b5b12-7cd5-4fb7-a1a8-56c2820973fb'; // C-103

        // 2. Find an available vehicle
        // A vehicle is available if it exists in VEHICULOS and is NOT in CUADRILLA_DIARIA for Today
        const todayStr = new Date().toISOString().split('T')[0]; // Use simple ISO for string match in SQL if needed, but safer to use DATE logic

        const availableRes = await pool.query(`
            SELECT TOP 1 placa 
            FROM VEHICULOS v
            WHERE v.estado = 'OPERATIVO'
            AND NOT EXISTS (
                SELECT 1 FROM CUADRILLA_DIARIA cd 
                WHERE cd.placa_vehiculo = v.placa 
                AND cd.fecha_operacion = '${todayStr}'
            )
        `);

        let newPlate = '';

        if (availableRes.recordset.length > 0) {
            newPlate = availableRes.recordset[0].placa;
            console.log(`✅ Found available vehicle: ${newPlate}`);
        } else {
            console.log("⚠️ No available vehicles found. Creating a temporary test vehicle 'TEST-999'...");
            newPlate = 'TEST-999';
            // Ensure TEST-999 exists
            await pool.query(`
                IF NOT EXISTS (SELECT * FROM VEHICULOS WHERE placa = 'TEST-999')
                BEGIN
                    INSERT INTO VEHICULOS (placa, marca, modelo, estado, anio)
                    VALUES ('TEST-999', 'TOYOTA', 'HILUX', 'OPERATIVO', 2024)
                END
            `);
        }

        // 3. Update the crew
        console.log(`Assigning ${newPlate} to crew ${crewToMove}...`);
        await pool.query(`
            UPDATE CUADRILLA_DIARIA
            SET placa_vehiculo = '${newPlate}'
            WHERE id_cuadrilla = '${crewToMove}'
        `);

        console.log("✅ Fixed.");

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        if (pool) await pool.close();
    }
}

fixDuplicateVehicles();
