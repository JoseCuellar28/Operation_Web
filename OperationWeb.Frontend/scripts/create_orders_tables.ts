
import { getConnection } from '../src/connections/sql';

async function createOrdersTables() {
    console.log('Connecting to database...');
    let pool;
    try {
        pool = await getConnection();
        console.log('Connected.');

        // 1. LOTE_IMPORTACION
        console.log('Checking Table: LOTE_IMPORTACION...');
        // Only create if not exists
        await pool.request().query(`
            IF OBJECT_ID('LOTE_IMPORTACION', 'U') IS NULL
            BEGIN
                CREATE TABLE LOTE_IMPORTACION (
                    id_lote INT IDENTITY(1,1) PRIMARY KEY,
                    fecha_carga DATETIME DEFAULT GETDATE(),
                    nombre_archivo_original NVARCHAR(255) NOT NULL,
                    fuente_origen NVARCHAR(100) NOT NULL,
                    total_registros INT NOT NULL,
                    filas_validas INT NOT NULL,
                    filas_error INT NOT NULL
                );
                PRINT 'LOTE_IMPORTACION created.';
            END
            ELSE
                PRINT 'LOTE_IMPORTACION already exists.';
        `);

        // 2. ORDENES_TRABAJO
        console.log('Checking Table: ORDENES_TRABAJO...');
        await pool.request().query(`
            IF OBJECT_ID('ORDENES_TRABAJO', 'U') IS NULL
            BEGIN
                CREATE TABLE ORDENES_TRABAJO (
                    id_ot UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
                    codigo_suministro NVARCHAR(50) NOT NULL,
                    cliente NVARCHAR(100) NOT NULL,
                    direccion_fisica NVARCHAR(255) NOT NULL,
                    comuna NVARCHAR(100) NULL,
                    sector NVARCHAR(100) NULL,
                    tipo_trabajo NVARCHAR(100) NULL,
                    estado NVARCHAR(50) NOT NULL DEFAULT 'PENDIENTE',
                    prioridad NVARCHAR(20) DEFAULT 'MEDIA',
                    notas NVARCHAR(MAX) NULL,
                    
                    id_lote_origen INT NOT NULL,
                    fecha_creacion DATETIME DEFAULT GETDATE(),
                    fecha_programada DATE NULL,
                    
                    latitud FLOAT NULL,
                    longitud FLOAT NULL,

                    CONSTRAINT FK_OT_LOTE FOREIGN KEY (id_lote_origen) REFERENCES LOTE_IMPORTACION(id_lote)
                );
                PRINT 'ORDENES_TRABAJO created.';
            END
            ELSE
                PRINT 'ORDENES_TRABAJO already exists.';
        `);

        console.log('✅ Orders tables created successfully.');
        await pool.close();

    } catch (err) {
        console.error('Error creating tables:', err);
        process.exit(1);
    }
}

createOrdersTables();
