
import { getConnection } from '../src/connections/sql';

async function checkData() {
    const pool = await getConnection();
    const res = await pool.request().query(`
        SELECT c.codigo, c.id_kit_materiales, k.nombre_kit, k.composicion_kit, col.nombre, col.dni
        FROM CUADRILLA_DIARIA c
        LEFT JOIN CATALOGO_KITS k ON c.id_kit_materiales = k.id_kit
        LEFT JOIN COLABORADORES col ON c.id_lider = col.id
        WHERE c.codigo = 'C-104'
    `);
    console.log(JSON.stringify(res.recordset, null, 2));
    process.exit();
}
checkData();
