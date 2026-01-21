
import sql from 'mssql';
import { getConnection } from '../src/connections/sql';

async function seedLogistics() {
    console.log('Seeding Logistics Demo Data...');
    let pool;
    try {
        pool = await getConnection();

        // 1. Ensure Materials
        console.log('1. Upserting Materials...');
        const matId1 = 'C8522771-479D-417A-885E-55364414A101'; // Mock GUIDs
        const matId2 = 'C8522771-479D-417A-885E-55364414A102';

        await pool.request().query(`
            MERGE CATALOGO_MATERIALES AS target
            USING (VALUES 
                ('${matId1}', 'CABLE UTP CAT6', 'CONSUMIBLE', 'METRO', 1.50, 'GES-001'),
                ('${matId2}', 'CONECTOR RJ45', 'CONSUMIBLE', 'UNIDAD', 0.50, 'GES-002'),
                (NEWID(), 'TALADRO PERCUTOR', 'ACTIVO', 'UNIDAD', 450.00, 'GES-999')
            ) AS source (id, nombre, tipo, unidad, costo, id_ges)
            ON target.id_material = source.id
            WHEN MATCHED THEN UPDATE SET nombre=source.nombre
            WHEN NOT MATCHED THEN INSERT (id_material, nombre, tipo, unidad_medida, costo_unitario, id_gesproyec)
            VALUES (source.id, source.nombre, source.tipo, source.unidad, source.costo, source.id_ges);
        `);

        // 2. Ensure Kit
        console.log('2. Creating Kit...');
        const kitJson = JSON.stringify([
            { id_material: matId1, nombre: 'CABLE UTP CAT6', cantidad: 300, tipo_custodio: 'VEHICULO' },
            { id_material: matId2, nombre: 'CONECTOR RJ45', cantidad: 50, tipo_custodio: 'VEHICULO' },
            // Need a tool uuid from DB, let's just use the ones we know or fetch the Taladro
        ]);

        // Update the Kit logic to include the Taladro dynamically if needed, but for now hardcode simpler.
        await pool.request()
            .input('json', sql.NVarChar, kitJson)
            .query(`
                IF NOT EXISTS (SELECT * FROM CATALOGO_KITS WHERE nombre_kit = 'KIT-DEMO-LOGISTICA')
                BEGIN
                    INSERT INTO CATALOGO_KITS (nombre_kit, tipo_servicio, composicion_kit)
                    VALUES ('KIT-DEMO-LOGISTICA', 'INSTALACION', @json);
                END
                ELSE
                BEGIN
                    UPDATE CATALOGO_KITS SET composicion_kit = @json WHERE nombre_kit = 'KIT-DEMO-LOGISTICA';
                END
            `);

        // Get Kit ID
        const kitRes = await pool.request().query("SELECT id_kit FROM CATALOGO_KITS WHERE nombre_kit = 'KIT-DEMO-LOGISTICA'");
        const idKit = kitRes.recordset[0].id_kit;

        // 3. Create Daily Crew for TODAY
        console.log('3. Creating Daily Crew for TODAY...');
        // Need a leader
        const lidRes = await pool.request().query("SELECT TOP 1 id FROM COLABORADORES ORDER BY id");
        const idLider = lidRes.recordset[0]?.id || 1;

        await pool.request()
            .input('kit', sql.Int, idKit)
            .input('lider', sql.Int, idLider)
            .query(`
                DELETE FROM CUADRILLA_DIARIA WHERE codigo = 'CUA-DEMO-LOG';
                
                INSERT INTO CUADRILLA_DIARIA (
                    id_cuadrilla, fecha_operacion, codigo, id_lider, id_auxiliar, 
                    placa_vehiculo, estado_planificacion, fecha_publicacion, id_kit_materiales
                )
                VALUES (
                    99999,
                    CAST(GETDATE() AS DATE), 
                    'CUA-DEMO-LOG', 
                    @lider, 
                    NULL, 
                    'MOTO-999', 
                    'PUBLICADA', 
                    GETDATE(),
                    @kit
                );
            `);

        console.log('✅ Logistics Demo Data Seeded.');

    } catch (err) {
        console.error('Error seeding:', err);
    } finally {
        process.exit();
    }
}

seedLogistics();
