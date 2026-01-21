import { getConnection } from '../src/connections/sql';
import sql from 'mssql';

async function updateSchemaPhase5() {
    console.log('Starting Phase 5 Schema Migration (Quality Control)...');
    let pool;
    try {
        pool = await getConnection();

        // 1. Update ORDENES_TRABAJO - Add Priority Flag
        console.log('Updating ORDENES_TRABAJO table...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ORDENES_TRABAJO') AND name = 'flag_prioridad_calidad')
            BEGIN
                ALTER TABLE ORDENES_TRABAJO ADD flag_prioridad_calidad BIT DEFAULT 0;
                PRINT 'Added column flag_prioridad_calidad';
            END
        `);

        // 2. Create AUDITORIA_LOG
        console.log('Creating AUDITORIA_LOG table...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('AUDITORIA_LOG') AND type in ('U'))
            BEGIN
                CREATE TABLE AUDITORIA_LOG (
                    id_log UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
                    id_ot UNIQUEIDENTIFIER NOT NULL,
                    campo_afectado NVARCHAR(100) NOT NULL,
                    valor_original NVARCHAR(MAX) NULL,
                    valor_final NVARCHAR(MAX) NULL,
                    usuario_ajuste INT NULL, -- FK to USER ID if available, or just ID
                    comentario_auditoria NVARCHAR(MAX) NULL,
                    fecha_cambio DATETIME DEFAULT GETDATE(),

                    CONSTRAINT FK_Auditoria_OT FOREIGN KEY (id_ot) REFERENCES ORDENES_TRABAJO(id_ot)
                );
                PRINT 'Created table AUDITORIA_LOG';
            END
        `);

        console.log('Phase 5 Schema Migration Completed Successfully!');

    } catch (err) {
        console.error('Error during migration:', err);
    } finally {
        if (pool) await pool.close();
    }
}

updateSchemaPhase5();
