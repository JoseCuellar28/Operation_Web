import { getConnection } from '../src/connections/sql';

async function createAttendanceTables() {
    console.log('🚧 Creating Attendance Tables in SQL Server...');
    let pool;
    try {
        pool = await getConnection();

        // 1. Create COLABORADORES Table
        console.log('Creating COLABORADORES table...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='COLABORADORES' AND xtype='U')
            BEGIN
                CREATE TABLE COLABORADORES (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    dni VARCHAR(20) NOT NULL UNIQUE,
                    nombre NVARCHAR(150) NOT NULL,
                    rol NVARCHAR(50) NOT NULL,
                    id_pin_biometrico VARCHAR(6) NULL, -- Nuevo campo para PIN
                    estado_operativo VARCHAR(20) DEFAULT 'ACTIVO', -- ENUM simulado
                    active BIT DEFAULT 1,
                    created_at DATETIME DEFAULT GETDATE(),
                    updated_at DATETIME DEFAULT GETDATE()
                );
                PRINT '✅ Table COLABORADORES created.';
            END
            ELSE
            BEGIN
                PRINT 'ℹ️ Table COLABORADORES already exists.';
                -- Add columns if they don't exist (Migration logic)
                IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'id_pin_biometrico' AND Object_ID = Object_ID(N'COLABORADORES'))
                BEGIN
                    ALTER TABLE COLABORADORES ADD id_pin_biometrico VARCHAR(6) NULL;
                    PRINT '   -> Added id_pin_biometrico column.';
                END
                 IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'estado_operativo' AND Object_ID = Object_ID(N'COLABORADORES'))
                BEGIN
                    ALTER TABLE COLABORADORES ADD estado_operativo VARCHAR(20) DEFAULT 'ACTIVO';
                    PRINT '   -> Added estado_operativo column.';
                END
            END
        `);

        // 2. Create ASISTENCIA_DIARIA Table
        console.log('Creating ASISTENCIA_DIARIA table...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ASISTENCIA_DIARIA' AND xtype='U')
            BEGIN
                CREATE TABLE ASISTENCIA_DIARIA (
                    id_registro VARCHAR(50) PRIMARY KEY, -- UUID from Supabase
                    id_colaborador INT NOT NULL, -- FK to COLABORADORES (Internal ID)
                    dni_colaborador VARCHAR(20) NULL, -- Redundancy for easier matching if needed
                    fecha_asistencia DATE NOT NULL,
                    hora_checkin DATETIME NULL,
                    lat_checkin DECIMAL(10, 7) NULL,
                    long_checkin DECIMAL(10, 7) NULL,
                    estado_final VARCHAR(20) NOT NULL, -- PRESENTE, TARDANZA, FALTA
                    justificacion_geo NVARCHAR(MAX) NULL,
                    check_salud_apto BIT NULL,
                    hora_checkout DATETIME NULL,
                    flag_horas_extras BIT DEFAULT 0,
                    created_at DATETIME DEFAULT GETDATE(),
                    CONSTRAINT FK_Asistencia_Colaborador FOREIGN KEY (id_colaborador) REFERENCES COLABORADORES(id)
                );
                PRINT '✅ Table ASISTENCIA_DIARIA created.';
            END
            ELSE
            BEGIN
                PRINT 'ℹ️ Table ASISTENCIA_DIARIA already exists.';
                -- Migration for new fields
                IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'location_address' AND Object_ID = Object_ID(N'ASISTENCIA_DIARIA'))
                BEGIN
                    ALTER TABLE ASISTENCIA_DIARIA ADD location_address NVARCHAR(255) NULL;
                    PRINT '   -> Added location_address column.';
                END
                IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'alert_status' AND Object_ID = Object_ID(N'ASISTENCIA_DIARIA'))
                BEGIN
                    ALTER TABLE ASISTENCIA_DIARIA ADD alert_status VARCHAR(20) DEFAULT 'pending';
                    PRINT '   -> Added alert_status column.';
                END
                IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'resolved_at' AND Object_ID = Object_ID(N'ASISTENCIA_DIARIA'))
                BEGIN
                    ALTER TABLE ASISTENCIA_DIARIA ADD resolved_at DATETIME NULL;
                    PRINT '   -> Added resolved_at column.';
                END
            END
        `);

        // 3. Add Missing Columns to COLABORADORES
        console.log('Checking COLABORADORES parity...');
        await pool.request().query(`
             IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'photo_url' AND Object_ID = Object_ID(N'COLABORADORES'))
             BEGIN
                 ALTER TABLE COLABORADORES ADD photo_url NVARCHAR(MAX) NULL;
                 PRINT '   -> Added photo_url column.';
             END
             IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'phone' AND Object_ID = Object_ID(N'COLABORADORES'))
             BEGIN
                 ALTER TABLE COLABORADORES ADD phone VARCHAR(20) NULL;
                 PRINT '   -> Added phone column.';
             END
        `);

        console.log('🎉 Attendance Schema sync complete.');

    } catch (err) {
        console.error('❌ Error creating tables:', err);
    } finally {
        if (pool) await pool.close();
    }
}

createAttendanceTables();
