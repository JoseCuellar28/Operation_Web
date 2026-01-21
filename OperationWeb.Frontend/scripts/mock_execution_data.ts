import { getConnection } from '../src/connections/sql';
import sql from 'mssql';

async function mockExecutionData() {
    console.log('Inserting Mock Execution Data...');
    let pool;
    try {
        pool = await getConnection();

        // 1. Get a Crew ID
        const crewRes = await pool.request().query("SELECT TOP 1 id_cuadrilla FROM CUADRILLA_DIARIA WHERE estado_planificacion = 'PUBLICADO'");
        const crewId = crewRes.recordset[0]?.id_cuadrilla;

        if (!crewId) {
            console.error('No published crew found. Run check_crews.ts or create one first.');
            return;
        }

        // 2. Insert Active Execution OT (Normal)
        const activeOTId = 'AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA'; // Pseudo UUID for ease
        console.log('Creating Active OT 45 mins ago...');
        await pool.request().query(`
            DELETE FROM ORDENES_TRABAJO WHERE id_ot = '${activeOTId}';
            INSERT INTO ORDENES_TRABAJO (
                id_ot, codigo_suministro, cliente, direccion_fisica,
                estado, hora_inicio_real, id_cuadrilla_asignada,
                fecha_programada, tipo_trabajo, latitud, longitud,
                id_lote_origen
            ) VALUES (
                '${activeOTId}', 'SUM-EXEC-001', 'Cliente Normal', 'Calle Los Pinos 123',
                'EJECUCION', DATEADD(MINUTE, -45, GETDATE()), '${crewId}',
                GETDATE(), 'INSTALACION', -12.0464, -77.0428,
                1
            )
        `);

        // 3. Insert Overdue Execution OT (Alert)
        const overdueOTId = 'BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB';
        console.log('Creating Overdue OT 150 mins ago...');
        await pool.request().query(`
            DELETE FROM ORDENES_TRABAJO WHERE id_ot = '${overdueOTId}';
            INSERT INTO ORDENES_TRABAJO (
                id_ot, codigo_suministro, cliente, direccion_fisica,
                estado, hora_inicio_real, id_cuadrilla_asignada,
                fecha_programada, tipo_trabajo, latitud, longitud,
                id_lote_origen
            ) VALUES (
                '${overdueOTId}', 'SUM-LATE-999', 'Cliente Retrasado', 'Av. Javier Prado 4500',
                'EJECUCION', DATEADD(MINUTE, -150, GETDATE()), '${crewId}',
                GETDATE(), 'MANTENIMIENTO', -12.089, -76.97,
                1
            )
        `);

        // 4. Insert Material Consumption for Active OT
        console.log('Inserting Materials...');
        await pool.request().query(`
            DELETE FROM CONSUMO_MATERIALES WHERE id_ot = '${activeOTId}';
            INSERT INTO CONSUMO_MATERIALES (id_ot, cod_material, cantidad, tipo_kardex, es_excedente)
            VALUES 
                ('${activeOTId}', 'CABLE-COAX-RG6', 15, 'INSTALADO', 0),
                ('${activeOTId}', 'CONECTOR-F', 2, 'INSTALADO', 0),
                ('${activeOTId}', 'DECO-HD', 1, 'INSTALADO', 0),
                ('${activeOTId}', 'DECO-SD-OLD', 1, 'RETIRADO', 0)
        `);

        // 5. Insert Evidence for Active OT
        console.log('Inserting Evidence...');
        await pool.request().query(`
            DELETE FROM EVIDENCIAS WHERE id_ot = '${activeOTId}';
            INSERT INTO EVIDENCIAS (id_ot, tipo_evidencia, url_archivo, timestamp_gps)
            VALUES 
                ('${activeOTId}', 'PANORAMICA', 'https://images.unsplash.com/photo-1599690925058-90e1a0b368a6?auto=format&fit=crop&q=80&w=600', GETDATE()),
                ('${activeOTId}', 'MEDIDOR', 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&q=80&w=600', GETDATE()),
                ('${activeOTId}', 'FIRMA_CLIENTE', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Signature_sample.svg/1200px-Signature_sample.svg.png', GETDATE())
        `);

        console.log('Mock Data Inserted Successfully!');

    } catch (err) {
        console.error('Error creating mock data:', err);
    } finally {
        if (pool) await pool.close();
    }
}

mockExecutionData();
