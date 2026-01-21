
import { getConnection } from '../src/connections/sql';

async function checkValidTypes() {
    try {
        const pool = await getConnection();
        // Check check constraints text (complex) or just list distinct existing values
        const res = await pool.request().query(`SELECT DISTINCT tipo FROM CATALOGO_MATERIALES`);
        console.log('Valid Types found in DB:', res.recordset.map(r => r.tipo));
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkValidTypes();
