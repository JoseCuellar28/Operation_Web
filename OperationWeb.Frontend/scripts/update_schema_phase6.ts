import { getConnection } from '../src/connections/sql';
import sql from 'mssql';

async function updateSchemaPhase6() {
    console.log('Starting Phase 6 Schema Migration (Liquidation)...');
    let pool;
    try {
        pool = await getConnection();

        // 1. Create LOTE_VALORIZACION
        console.log('Creating LOTE_VALORIZACION table...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('LOTE_VALORIZACION') AND type in ('U'))
            BEGIN
                CREATE TABLE LOTE_VALORIZACION (
                    id_lote INT IDENTITY(1,1) PRIMARY KEY,
                    codigo_lote NVARCHAR(50) NOT NULL UNIQUE, -- e.g. 'VAL-2025-001'
                    cliente NVARCHAR(100) NOT NULL,
                    mes_valorizacion NVARCHAR(20) NOT NULL, -- '2025-10'
                    estado NVARCHAR(50) DEFAULT 'BORRADOR', -- 'BORRADOR', 'ENVIADO', 'CERRADO'
                    fecha_generacion DATETIME DEFAULT GETDATE(),
                    total_facturado DECIMAL(18, 2) DEFAULT 0,
                    snapshot_precios NVARCHAR(MAX) NULL -- JSON string
                );
                PRINT 'Created table LOTE_VALORIZACION';
            END
        `);

        // 2. Update ORDENES_TRABAJO
        console.log('Updating ORDENES_TRABAJO table...');

        // Add id_lote_asignado
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ORDENES_TRABAJO') AND name = 'id_lote_asignado')
            BEGIN
                ALTER TABLE ORDENES_TRABAJO ADD id_lote_asignado INT NULL;
                ALTER TABLE ORDENES_TRABAJO ADD CONSTRAINT FK_OT_Lote FOREIGN KEY (id_lote_asignado) REFERENCES LOTE_VALORIZACION(id_lote);
                PRINT 'Added column id_lote_asignado';
            END
        `);

        // Add flag_extemporanea
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ORDENES_TRABAJO') AND name = 'flag_extemporanea')
            BEGIN
                ALTER TABLE ORDENES_TRABAJO ADD flag_extemporanea BIT DEFAULT 0;
                PRINT 'Added column flag_extemporanea';
            END
        `);

        // Add justificacion_tardia
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ORDENES_TRABAJO') AND name = 'justificacion_tardia')
            BEGIN
                ALTER TABLE ORDENES_TRABAJO ADD justificacion_tardia NVARCHAR(MAX) NULL;
                PRINT 'Added column justificacion_tardia';
            END
        `);

        // Ensure 'estado' column is long enough for new statuses like 'FACTURACION_EN_PROCESO'
        // (Likely done in Phase 4 but good to safeguard)
        await pool.request().query(`
            ALTER TABLE ORDENES_TRABAJO ALTER COLUMN estado NVARCHAR(50) NOT NULL;
         `);

        console.log('Phase 6 Schema Migration Completed Successfully!');

    } catch (err) {
        console.error('Error during migration:', err);
    } finally {
        if (pool) await pool.close();
    }
}

updateSchemaPhase6();
