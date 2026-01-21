
import { getConnection } from '../src/connections/sql';

async function updateImages() {
    const pool = await getConnection();
    console.log('Injecting Real Images into Evidence...');

    // 1. Clear existing evidence for liquidation mocks (simple approx)
    // Actually, let's just insert new evidence for the candidates we just created
    // Get IDs of candidates
    const res = await pool.request().query("SELECT id_ot FROM ORDENES_TRABAJO WHERE estado IN ('VALIDADA_OK', 'VALIDADA_CON_AJUSTE')");
    const ids = res.recordset.map(r => r.id_ot);

    for (const id of ids) {
        // Delete old evidence for cleanliness in demo
        await pool.request().query(`DELETE FROM EVIDENCIAS WHERE id_ot = '${id}'`);

        // Insert 3 Real-looking photos
        // 1. Medidor (Meter)
        await pool.request().query(`
           INSERT INTO EVIDENCIAS (id_ot, tipo_evidencia, url_archivo, timestamp_gps)
           VALUES ('${id}', 'FOTO_MEDIDOR', 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&w=800&q=80', '2025-10-15 09:30:00')
       `);

        // 2. Tablero (Panel)
        await pool.request().query(`
           INSERT INTO EVIDENCIAS (id_ot, tipo_evidencia, url_archivo, timestamp_gps)
           VALUES ('${id}', 'FOTO_TABLERO', 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80', '2025-10-15 10:15:00')
       `);

        // 3. Tecnico (Technician working)
        await pool.request().query(`
           INSERT INTO EVIDENCIAS (id_ot, tipo_evidencia, url_archivo, timestamp_gps)
           VALUES ('${id}', 'FOTO_TECNICO', 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80', '2025-10-15 11:00:00')
       `);
    }

    console.log(`Updated images for ${ids.length} OTs.`);
    pool.close();
}

updateImages();
