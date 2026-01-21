
import sql from 'mssql';
import { getConnection } from '../src/connections/sql';

async function checkColumns() {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'CUADRILLA_DIARIA'
        `);
        console.log('Columnas de CUADRILLA_DIARIA:', result.recordset.map(r => r.COLUMN_NAME));
        pool.close();
    } catch (err) {
        console.error(err);
    }
}
checkColumns();
