
import { getConnection, sql } from '../src/connections/sql';

async function addHesColumns() {
    try {
        console.log('Connecting to database...');
        const pool = await getConnection();

        console.log('Adding columns to LOTE_VALORIZACION...');

        // Add columns if they don't exist
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('LOTE_VALORIZACION') AND name = 'numero_hes')
            BEGIN
                ALTER TABLE LOTE_VALORIZACION ADD numero_hes NVARCHAR(50) NULL;
                PRINT 'Added numero_hes';
            END

            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('LOTE_VALORIZACION') AND name = 'fecha_aprobacion_hes')
            BEGIN
                ALTER TABLE LOTE_VALORIZACION ADD fecha_aprobacion_hes DATETIME NULL;
                PRINT 'Added fecha_aprobacion_hes';
            END

            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('LOTE_VALORIZACION') AND name = 'fecha_pago_probable')
            BEGIN
                ALTER TABLE LOTE_VALORIZACION ADD fecha_pago_probable DATETIME NULL;
                PRINT 'Added fecha_pago_probable';
            END
        `);

        console.log('Columns added successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error modifying schema:', error);
        process.exit(1);
    }
}

addHesColumns();
