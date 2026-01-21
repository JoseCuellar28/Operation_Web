
import sql from 'mssql';
import { getConnection } from '../src/connections/sql';

async function fixAndPopulate() {
    console.log('🔧 Fixing Kits and Populating Stock...');
    let pool;
    try {
        pool = await getConnection();

        // 1. Get Valid Kit IDs (Created by previous seed)
        const validKits = await pool.request().query(`
            SELECT id_kit, nombre_kit 
            FROM CATALOGO_KITS 
            WHERE nombre_kit IN ('KIT-HFC-BASICO', 'KIT-FTTH-PREMIUM', 'KIT-MANTENIMIENTO-GRAL')
        `);

        if (validKits.recordset.length === 0) {
            console.error('❌ No valid kits found. Run seed_comprehensive_kits.ts first.');
            return;
        }

        const validKitIds = validKits.recordset.map(k => k.id_kit);
        console.log(`found ${validKitIds.length} valid kits.`);

        // 2. Reassign ALL today's crews to valid kits
        const crews = await pool.request().query(`SELECT id_cuadrilla FROM CUADRILLA_DIARIA WHERE fecha_operacion = CAST(GETDATE() AS DATE)`);

        console.log(`Reassigning ${crews.recordset.length} crews to valid kits...`);
        for (const crew of crews.recordset) {
            const randomKit = validKitIds[Math.floor(Math.random() * validKitIds.length)];
            await pool.request().query(`
                UPDATE CUADRILLA_DIARIA 
                SET id_kit_materiales = ${randomKit}
                WHERE id_cuadrilla = '${crew.id_cuadrilla}'
            `);
        }
        console.log('✅ Crews reassigned.');

        // 3. Populate Warehouse Stock (Infinite Stock for Demo)
        console.log('🏭 Populating Warehouse Stock...');

        // Truncate Stock?? No, merge.
        // Get all materials
        const materials = await pool.request().query('SELECT id_material FROM CATALOGO_MATERIALES');

        for (const mat of materials.recordset) {
            // Upsert 10000 units
            await pool.request()
                .input('mat', sql.UniqueIdentifier, mat.id_material)
                .query(`
                    MERGE STOCK_ALMACEN AS target
                    USING (SELECT 'MAIN' as id_almacen, @mat as id_material) AS source
                    ON (target.id_almacen = source.id_almacen AND target.id_material = source.id_material)
                    WHEN MATCHED THEN
                        UPDATE SET cantidad = 10000
                    WHEN NOT MATCHED THEN
                        INSERT (id_almacen, id_material, cantidad, ultima_actualizacion)
                        VALUES ('MAIN', @mat, 10000, GETDATE());
                `);
        }
        console.log('✅ Warehouse Stock set to 10,000 for all items.');

        // 4. Clean bad history for demo clarity? 
        // Optional: clear movements from today to start fresh? 
        // User asked "insertar datos de prueba en todas las tablas que esten sin datos".
        // Let's ensure at least one movement exists so the table isn't empty.

        await pool.request().query(`
            IF NOT EXISTS (SELECT 1 FROM MOVIMIENTOS_ALMACEN WHERE tipo_movimiento = 'ENTRADA_COMPRA' AND CAST(fecha AS DATE) = CAST(GETDATE() AS DATE))
            BEGIN
                INSERT INTO MOVIMIENTOS_ALMACEN (tipo_movimiento, id_material, cantidad, origen, destino, usuario_responsable, documento_ref)
                SELECT TOP 1 'ENTRADA_COMPRA', id_material, 10000, 'PROVEEDOR', 'MAIN', 'SYSTEM', 'INIT-STOCK'
                FROM CATALOGO_MATERIALES
            END
        `);
        console.log('✅ Initial Movement logged.');

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        process.exit();
    }
}
fixAndPopulate();
