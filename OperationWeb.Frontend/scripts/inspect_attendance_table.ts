
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

async function inspectAttendance() {
    let pool;
    try {
        pool = await sql.connect(config);

        const res = await pool.query(`
            SELECT COLUMN_NAME, DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'ASISTENCIA_DIARIA'
        `);

        console.table(res.recordset);

    } catch (err) {
        console.error(err);
    } finally {
        if (pool) await pool.close();
    }
}

inspectAttendance();
