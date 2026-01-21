
import { getConnection } from '../src/connections/sql';

async function inspectData() {
    try {
        const pool = await getConnection();

        console.log('--- PERFILES (WORK PROFILES) ---');
        const profiles = await pool.request().query('SELECT * FROM PERFILES_TRABAJO');
        console.table(profiles.recordset);

        console.log('--- KITS MATERIALES ---');
        const kits = await pool.request().query('SELECT id_kit, nombre_kit FROM CATALOGO_KITS');
        console.table(kits.recordset);

        console.log('--- KITS DOCUMENTALES (FORMATOS) ---');
        const formats = await pool.request().query('SELECT id_formato, nombre FROM FORMATOS_PAPELERIA');
        console.table(formats.recordset);

        await pool.close();
    } catch (err) {
        console.error(err);
    }
}

inspectData();
