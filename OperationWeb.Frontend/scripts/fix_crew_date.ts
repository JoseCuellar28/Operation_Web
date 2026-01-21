
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

async function checkCrewDate() {
    let pool;
    try {
        pool = await sql.connect(config);

        const res = await pool.query(`
            SELECT id_cuadrilla, placa_vehiculo, fecha_operacion 
            FROM CUADRILLA_DIARIA 
            WHERE placa_vehiculo = 'ABC-123'
            ORDER BY fecha_operacion DESC
        `);

        console.log('Crew Records for ABC-123:');
        console.table(res.recordset);

        // Auto-fix: Update to today if exists
        if (res.recordset.length > 0) {
            console.log('Updating crew date to TODAY...');
            await pool.query(`
                UPDATE CUADRILLA_DIARIA 
                SET fecha_operacion = GETDATE() 
                WHERE placa_vehiculo = 'ABC-123'
            `);
            console.log('Update Complete.');
        }

    } catch (err) {
        console.error(err);
    } finally {
        if (pool) await pool.close();
    }
}

checkCrewDate();
