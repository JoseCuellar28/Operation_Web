
import sql from 'mssql';
import { getConnection } from '../src/connections/sql';

async function createTables() {
    console.log('Connecting to database...');
    let pool;
    try {
        pool = await getConnection();
        console.log('Connected.');

        // 1. CATALOGO_MATERIALES
        console.log('Creating Table: CATALOGO_MATERIALES...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CATALOGO_MATERIALES')
            BEGIN
                CREATE TABLE CATALOGO_MATERIALES (
                    id_material UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
                    nombre NVARCHAR(255) NOT NULL,
                    tipo NVARCHAR(20) NOT NULL CHECK (tipo IN ('ACTIVO', 'CONSUMIBLE')),
                    unidad_medida NVARCHAR(50) NOT NULL,
                    costo_unitario DECIMAL(10, 2) NOT NULL
                );
                PRINT 'CATALOGO_MATERIALES created.';
            END
            ELSE PRINT 'CATALOGO_MATERIALES already exists.';
        `);

        // 2. VEHICULOS
        console.log('Creating Table: VEHICULOS...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'VEHICULOS')
            BEGIN
                CREATE TABLE VEHICULOS (
                    placa NVARCHAR(20) PRIMARY KEY,
                    marca NVARCHAR(100) NOT NULL,
                    tipo_activo NVARCHAR(20) NOT NULL CHECK (tipo_activo IN ('MOTO', 'CAMIONETA', 'MINIVAN')),
                    max_volumen NVARCHAR(10) NOT NULL CHECK (max_volumen IN ('ALTO', 'BAJO')),
                    estado NVARCHAR(20) NOT NULL CHECK (estado IN ('OPERATIVO', 'TALLER')),
                    CONSTRAINT CK_VEHICULOS_MOTO_VOLUMEN CHECK (
                        (tipo_activo = 'MOTO' AND max_volumen = 'BAJO') OR 
                        (tipo_activo <> 'MOTO')
                    )
                );
                PRINT 'VEHICULOS created.';
            END
            ELSE PRINT 'VEHICULOS already exists.';
        `);

        // 3. CATALOGO_KITS
        console.log('Creating Table: CATALOGO_KITS...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CATALOGO_KITS')
            BEGIN
                CREATE TABLE CATALOGO_KITS (
                    id_kit INT IDENTITY(1,1) PRIMARY KEY,
                    nombre_kit NVARCHAR(100) NOT NULL,
                    tipo_servicio NVARCHAR(50) NOT NULL,
                    composicion_kit NVARCHAR(MAX) NOT NULL CHECK (ISJSON(composicion_kit) > 0)
                );
                PRINT 'CATALOGO_KITS created.';
            END
            ELSE PRINT 'CATALOGO_KITS already exists.';
        `);

        // 4. FORMATOS_PAPELERIA
        console.log('Creating Table: FORMATOS_PAPELERIA...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'FORMATOS_PAPELERIA')
            BEGIN
                CREATE TABLE FORMATOS_PAPELERIA (
                    id_formato INT IDENTITY(1,1) PRIMARY KEY,
                    nombre NVARCHAR(100) NOT NULL,
                    control_series BIT NOT NULL DEFAULT 0,
                    rango_inicio INT NULL,
                    rango_fin INT NULL
                );
                PRINT 'FORMATOS_PAPELERIA created.';
            END
            ELSE PRINT 'FORMATOS_PAPELERIA already exists.';
        `);

        console.log('✅ All tables checked/created successfully.');

        // Use close() on the pool if it was a direct connection, but getConnection usually returns a global pool.
        // If your sql.ts implementation caches the pool, we might not want to close it if the app was running, 
        // but this is a script. 
        // Assuming pure script usage:
        await pool.close();

    } catch (err) {
        console.error('Error creating tables:', err);
        process.exit(1);
    }
}

createTables();
