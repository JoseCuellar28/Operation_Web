
import sql from 'mssql';
import { getConnection } from '../src/connections/sql';

async function listTables() {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT name FROM sys.tables 
            WHERE name IN ('CATALOGO_MATERIALES', 'VEHICULOS', 'CATALOGO_KITS', 'FORMATOS_PAPELERIA', 'work_orders', 'crews')
        `);
        console.log('Found tables:', result.recordset.map(r => r.name));
        await pool.close();
    } catch (err) {
        console.error(err);
    }
}

listTables();
