import { getConnection } from '../src/connections/sql';
import sql from 'mssql';

async function mockQualityData() {
    console.log('Inserting Mock Quality Control Data...');
    let pool;
    try {
        pool = await getConnection();

        // 1. Get a Crew ID
        const crewRes = await pool.request().query("SELECT TOP 1 id_cuadrilla FROM CUADRILLA_DIARIA");
        const crewId = crewRes.recordset[0]?.id_cuadrilla;

        // 2. Insert Priority OT (Red Alert)
        const priorityOTId = 'DDDDDDDD-DDDD-DDDD-DDDD-DDDDDDDDDDDD';
        console.log('Creating Priority OT (Closed w/ Issues)...');
        await pool.request().query(`
            DELETE FROM ORDENES_TRABAJO WHERE id_ot = '${priorityOTId}';
            INSERT INTO ORDENES_TRABAJO (
                id_ot, codigo_suministro, cliente, direccion_fisica,
                estado, hora_inicio_real, hora_fin_real, id_cuadrilla_asignada,
                fecha_programada, tipo_trabajo, latitud, longitud,
                flag_prioridad_calidad, id_lote_origen
            ) VALUES (
                '${priorityOTId}', 'SUM-QUAL-RED', 'Cliente Prioritario', 'Av. Riesgo 666',
                'CERRADA_TECNICO', DATEADD(MINUTE, -120, GETDATE()), DATEADD(MINUTE, -30, GETDATE()), '${crewId}',
                GETDATE(), 'AVERIA', -12.05, -77.05,
                1, 1
            )
        `);

        // 3. Insert Normal OT
        const normalOTId = 'EEEEEEEE-EEEE-EEEE-EEEE-EEEEEEEEEEEE';
        console.log('Creating Normal OT (Closed Clean)...');
        await pool.request().query(`
            DELETE FROM ORDENES_TRABAJO WHERE id_ot = '${normalOTId}';
            INSERT INTO ORDENES_TRABAJO (
                id_ot, codigo_suministro, cliente, direccion_fisica,
                estado, hora_inicio_real, hora_fin_real, id_cuadrilla_asignada,
                fecha_programada, tipo_trabajo, latitud, longitud,
                flag_prioridad_calidad, id_lote_origen
            ) VALUES (
                '${normalOTId}', 'SUM-QUAL-OK', 'Cliente Limpio', 'Calle Paz 777',
                'CERRADA_TECNICO', DATEADD(MINUTE, -200, GETDATE()), DATEADD(MINUTE, -100, GETDATE()), '${crewId}',
                GETDATE(), 'MANTENIMIENTO', -12.06, -77.06,
                0, 1
            )
        `);

        // 4. Insert Materials for Priority OT (Surplus)
        await pool.request().query(`
            DELETE FROM CONSUMO_MATERIALES WHERE id_ot = '${priorityOTId}';
            INSERT INTO CONSUMO_MATERIALES (id_ot, cod_material, cantidad, tipo_kardex, es_excedente)
            VALUES 
                ('${priorityOTId}', 'MODEM-HFC', 1, 'INSTALADO', 0),
                ('${priorityOTId}', 'CABLE-RG6', 250, 'INSTALADO', 1) -- Surplus
        `);

        // 5. Insert Evidence
        await pool.request().query(`
            DELETE FROM EVIDENCIAS WHERE id_ot = '${priorityOTId}';
            INSERT INTO EVIDENCIAS (id_ot, tipo_evidencia, url_archivo, timestamp_gps)
            VALUES ('${priorityOTId}', 'EVIDENCIA_ACTA', 'https://images.unsplash.com/photo-1629909615184-74f495363b63?auto=format&fit=crop&q=80&w=600', GETDATE())
        `);

        console.log('Mock Quality Data Inserted Successfully!');

    } catch (err) {
        console.error('Error creating mock quality data:', err);
    } finally {
        if (pool) await pool.close();
    }
}

mockQualityData();
