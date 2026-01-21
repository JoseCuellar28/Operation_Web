
import { getConnection } from '../src/connections/sql';

async function alterOrdersTable() {
    console.log('Connecting to database...');
    let pool;
    try {
        pool = await getConnection();
        console.log('Connected.');

        console.log('Checking for assignment columns in ORDENES_TRABAJO...');

        // Add id_cuadrilla_asignada if not exists
        await pool.request().query(`
            IF NOT EXISTS (
                SELECT * FROM sys.columns 
                WHERE object_id = OBJECT_ID('ORDENES_TRABAJO') 
                AND name = 'id_cuadrilla_asignada'
            )
            BEGIN
                ALTER TABLE ORDENES_TRABAJO
                ADD id_cuadrilla_asignada NVARCHAR(50) NULL; 
                -- Using NVARCHAR to match Crew ID string format, though UUID is better if crews use UUIDs.
                -- Frontend generates string IDs for crews often (UUIDs), so NVARCHAR/UniqueId is safe.
                -- Based on CUADRILLA_DIARIA.id_cuadrilla definition (Check?)
                PRINT 'Column id_cuadrilla_asignada added.';
            END
            ELSE
                PRINT 'Column id_cuadrilla_asignada already exists.';
        `);

        // Add orden_visita
        await pool.request().query(`
            IF NOT EXISTS (
                SELECT * FROM sys.columns 
                WHERE object_id = OBJECT_ID('ORDENES_TRABAJO') 
                AND name = 'orden_visita'
            )
            BEGIN
                ALTER TABLE ORDENES_TRABAJO
                ADD orden_visita INT NULL;
                PRINT 'Column orden_visita added.';
            END
            ELSE
                PRINT 'Column orden_visita already exists.';
        `);

        console.log('✅ Alter table completed.');
        await pool.close();

    } catch (err) {
        console.error('Error altering table:', err);
        process.exit(1);
    }
}

alterOrdersTable();
