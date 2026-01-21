
import { getConnection } from '../src/connections/sql';

async function seedYesterdayCrew() {
    console.log('🌱 Seeding Yesterday Crew...');
    let pool;
    try {
        pool = await getConnection();

        // Calculate Yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // Check and Seed Leader
        let leaderRes = await pool.request().query("SELECT TOP 1 id FROM COLABORADORES WHERE dni = '99999999'");
        if (leaderRes.recordset.length === 0) {
            // Check if ANY leader exists
            leaderRes = await pool.request().query("SELECT TOP 1 id FROM COLABORADORES WHERE rol = 'LIDER'");
            if (leaderRes.recordset.length === 0) {
                console.log('Inserting default Leader...');
                await pool.request().query("INSERT INTO COLABORADORES (nombre, rol, estado_operativo, active, dni) VALUES ('Lider Test', 'LIDER', 'ACTIVO', 1, '99999999')");
                leaderRes = await pool.request().query("SELECT TOP 1 id FROM COLABORADORES WHERE dni = '99999999'");
            }
        }

        // Check and Seed Vehicle
        let vehRes = await pool.request().query("SELECT TOP 1 placa FROM VEHICULOS");
        if (vehRes.recordset.length === 0) {
            console.log('Inserting default Vehicle...');
            await pool.request().query("INSERT INTO VEHICULOS (placa, marca, tipo_activo, max_volumen, estado) VALUES ('ABC-111', 'Toyota', 'CAMIONETA', 'ALTO', 'OPERATIVO')");
            vehRes = await pool.request().query("SELECT TOP 1 placa FROM VEHICULOS");
        }

        const auxRes = await pool.request().query("SELECT TOP 1 id FROM COLABORADORES WHERE rol = 'AUXILIAR'");
        const zoneRes = await pool.request().query("SELECT TOP 1 id_zona FROM ZONAS");
        const profileRes = await pool.request().query("SELECT TOP 1 id_perfil FROM PERFILES_TRABAJO");
        // Kits are usually ID 1 if seeded.

        const leaderId = leaderRes.recordset[0].id;
        const auxId = auxRes.recordset.length > 0 ? auxRes.recordset[0].id : 'NULL';
        const plate = vehRes.recordset[0].placa;
        const zoneId = zoneRes.recordset[0]?.id_zona || 1;
        const profileId = profileRes.recordset[0]?.id_perfil || 1;

        console.log(`Seeding Crew for date: ${yesterdayStr}`);

        await pool.request().query(`
            DELETE FROM CUADRILLA_DIARIA WHERE fecha_operacion = '${yesterdayStr}'
        `);

        await pool.request().query(`
            INSERT INTO CUADRILLA_DIARIA (
                id_cuadrilla, codigo, fecha_operacion, estado_planificacion,
                id_lider, id_auxiliar, placa_vehiculo,
                id_zona, id_perfil, id_kit_materiales, id_kit_documentos,
                fecha_publicacion
            ) VALUES (
                NEWID(), 'C-999', '${yesterdayStr}', 'PUBLICADO',
                ${leaderId}, ${auxId}, '${plate}',
                ${zoneId}, ${profileId}, 1, 1,
                GETDATE()
            )
        `);

        console.log('✅ Yesterday Crew Seeded.');
        await pool.close();

    } catch (err) {
        console.error('❌ Error seeding yesterday crew:', err);
        process.exit(1);
    }
}

seedYesterdayCrew();
