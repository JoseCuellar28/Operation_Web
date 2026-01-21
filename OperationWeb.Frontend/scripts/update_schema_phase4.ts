import { getConnection } from '../src/connections/sql';
import sql from 'mssql';

async function updateSchemaPhase4() {
    console.log('Starting Phase 4 Schema Migration...');
    let pool;
    try {
        pool = await getConnection();

        // 1. Update ORDENES_TRABAJO
        console.log('Updating ORDENES_TRABAJO table...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ORDENES_TRABAJO') AND name = 'hora_inicio_real')
            BEGIN
                ALTER TABLE ORDENES_TRABAJO ADD hora_inicio_real DATETIME NULL;
                PRINT 'Added column hora_inicio_real';
            END

            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ORDENES_TRABAJO') AND name = 'hora_fin_real')
            BEGIN
                ALTER TABLE ORDENES_TRABAJO ADD hora_fin_real DATETIME NULL;
                PRINT 'Added column hora_fin_real';
            END

            -- Ensure estado column is long enough for new statuses like 'CERRADA_TECNICO'
            ALTER TABLE ORDENES_TRABAJO ALTER COLUMN estado NVARCHAR(50) NOT NULL;

            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ORDENES_TRABAJO') AND name = 'justificacion_geo_ot')
            BEGIN
                ALTER TABLE ORDENES_TRABAJO ADD justificacion_geo_ot NVARCHAR(MAX) NULL;
                PRINT 'Added column justificacion_geo_ot';
            END

            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ORDENES_TRABAJO') AND name = 'motivo_fallida')
            BEGIN
                ALTER TABLE ORDENES_TRABAJO ADD motivo_fallida NVARCHAR(255) NULL;
                PRINT 'Added column motivo_fallida';
            END
        `);

        // 2. Create CONSUMO_MATERIALES
        console.log('Creating CONSUMO_MATERIALES table...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('CONSUMO_MATERIALES') AND type in ('U'))
            BEGIN
                CREATE TABLE CONSUMO_MATERIALES (
                    id_consumo UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
                    id_ot UNIQUEIDENTIFIER NOT NULL,
                    cod_material NVARCHAR(50) NOT NULL,
                    cantidad INT NOT NULL,
                    tipo_kardex NVARCHAR(20) NOT NULL CHECK (tipo_kardex IN ('INSTALADO', 'RETIRADO', 'SOBRANTE')),
                    serie_retirada NVARCHAR(100) NULL,
                    es_excedente BIT DEFAULT 0,
                    url_foto_justificacion NVARCHAR(MAX) NULL,
                    fecha_registro DATETIME DEFAULT GETDATE(),
                    
                    CONSTRAINT FK_Consumo_OT FOREIGN KEY (id_ot) REFERENCES ORDENES_TRABAJO(id_ot)
                );
                PRINT 'Created table CONSUMO_MATERIALES';
            END
        `);

        // 3. Create EVIDENCIAS
        console.log('Creating EVIDENCIAS table...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('EVIDENCIAS') AND type in ('U'))
            BEGIN
                CREATE TABLE EVIDENCIAS (
                    id_evidencia UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
                    id_ot UNIQUEIDENTIFIER NOT NULL,
                    tipo_evidencia NVARCHAR(50) NOT NULL, -- 'EVIDENCIA_ACTA', 'PANORAMICA', 'MEDIDOR', 'FIRMA_CLIENTE'
                    url_archivo NVARCHAR(MAX) NOT NULL,
                    timestamp_gps DATETIME NULL,
                    latitud FLOAT NULL,
                    longitud FLOAT NULL,
                    fecha_carga DATETIME DEFAULT GETDATE(),

                    CONSTRAINT FK_Evidencia_OT FOREIGN KEY (id_ot) REFERENCES ORDENES_TRABAJO(id_ot)
                );
                PRINT 'Created table EVIDENCIAS';
            END
        `);

        console.log('Phase 4 Schema Migration Completed Successfully!');

    } catch (err) {
        console.error('Error during migration:', err);
    } finally {
        if (pool) await pool.close();
    }
}

updateSchemaPhase4();
