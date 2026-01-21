import { getConnection } from '../src/connections/sql';
import sql from 'mssql';

async function createHseTables() {
    console.log('Connecting to database for HSE Schema updates...');
    let pool;
    try {
        pool = await getConnection();
        console.log('Connected.');

        // 1. INCIDENTES Table
        console.log('Creating/Updating Table: INCIDENTES...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'INCIDENTES')
            BEGIN
                CREATE TABLE INCIDENTES (
                    id_incidente INT IDENTITY(1,1) PRIMARY KEY,
                    id_cuadrilla NVARCHAR(50) NOT NULL, -- Links to CUADRILLA_DIARIA.id_cuadrilla (UUID string)
                    gravedad NVARCHAR(20) NOT NULL CHECK (gravedad IN ('LEVE', 'GRAVE', 'MORTAL')),
                    descripcion NVARCHAR(MAX),
                    evidencia_url NVARCHAR(MAX),
                    estado NVARCHAR(20) NOT NULL DEFAULT 'ABIERTO' CHECK (estado IN ('ABIERTO', 'CERRADO', 'ESCALADO')),
                    timestamp_inicio DATETIME DEFAULT GETDATE(),
                    timestamp_cierre DATETIME NULL
                );
                CREATE INDEX IDX_INCIDENTES_CUADRILLA ON INCIDENTES(id_cuadrilla);
                PRINT 'INCIDENTES created.';
            END
            ELSE PRINT 'INCIDENTES already exists.';
        `);

        // 2. AUDITORIA_SEGURIDAD Table
        console.log('Creating/Updating Table: AUDITORIA_SEGURIDAD...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AUDITORIA_SEGURIDAD')
            BEGIN
                CREATE TABLE AUDITORIA_SEGURIDAD (
                    id_auditoria INT IDENTITY(1,1) PRIMARY KEY,
                    id_colaborador INT NOT NULL,
                    id_supervisor INT NOT NULL,
                    score INT NOT NULL,
                    resultado NVARCHAR(20) NOT NULL CHECK (resultado IN ('APROBADO', 'BLOQUEADO')),
                    motivo_bloqueo NVARCHAR(MAX),
                    checklist_json NVARCHAR(MAX), -- Dynamic JSON
                    id_ot_vinculada NVARCHAR(50) NULL, -- UUID of OT
                    fecha_auditoria DATETIME DEFAULT GETDATE(),

                    CONSTRAINT FK_AUDITORIA_COLABORADOR FOREIGN KEY (id_colaborador) REFERENCES COLABORADORES(id),
                    CONSTRAINT FK_AUDITORIA_SUPERVISOR FOREIGN KEY (id_supervisor) REFERENCES COLABORADORES(id)
                );
                PRINT 'AUDITORIA_SEGURIDAD created.';
            END
            ELSE PRINT 'AUDITORIA_SEGURIDAD already exists.';
        `);

        // 3. ALTER COLABORADORES
        console.log('Altering Table: COLABORADORES...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('COLABORADORES') AND name = 'estado_operativo')
            BEGIN
                ALTER TABLE COLABORADORES ADD estado_operativo NVARCHAR(50) DEFAULT 'ACTIVO';
                PRINT 'Added estado_operativo to COLABORADORES.';
            END
            ELSE PRINT 'COLABORADORES.estado_operativo already exists.';
        `);

        // 4. ALTER CUADRILLA_DIARIA for Versioning
        console.log('Altering Table: CUADRILLA_DIARIA...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CUADRILLA_DIARIA') AND name = 'version')
            BEGIN
                ALTER TABLE CUADRILLA_DIARIA ADD version INT DEFAULT 1;
                ALTER TABLE CUADRILLA_DIARIA ADD id_cuadrilla_origen NVARCHAR(50) NULL;
                PRINT 'Added version columns to CUADRILLA_DIARIA.';
                 -- Note: Updating check constraint is complex in SQL Server T-SQL blindly, 
                 -- we usually drop and recreate constraint. For now we assume logic handles the string status.
                 -- Or we can try to add the check if not exists.
                 -- Let's just rely on App Logic for now or loose constraint.
            END
            ELSE PRINT 'CUADRILLA_DIARIA version columns already exist.';
        `);

        console.log('✅ HSE & Supervision Tables configured successfully.');
        await pool.close();

    } catch (err) {
        console.error('Error creating HSE tables:', err);
        process.exit(1);
    }
}

createHseTables();
