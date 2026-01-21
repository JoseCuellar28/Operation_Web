import { getConnection } from '../src/connections/sql';

async function forceUpdate() {
    const pool = await getConnection();
    console.log('Forcing Schema Update...');

    try {
        await pool.request().query("ALTER TABLE ORDENES_TRABAJO ADD id_lote_asignado INT NULL");
        console.log('Added id_lote_asignado');
    } catch (e) { console.log('id_lote_asignado might exist'); }

    try {
        await pool.request().query("ALTER TABLE ORDENES_TRABAJO ADD flag_extemporanea BIT DEFAULT 0");
        console.log('Added flag_extemporanea');
    } catch (e) { console.log('flag_extemporanea might exist'); }

    try {
        await pool.request().query("ALTER TABLE ORDENES_TRABAJO ADD justificacion_tardia NVARCHAR(MAX) NULL");
        console.log('Added justificacion_tardia');
    } catch (e) { console.log('justificacion_tardia might exist'); }

    pool.close();
}
forceUpdate();
