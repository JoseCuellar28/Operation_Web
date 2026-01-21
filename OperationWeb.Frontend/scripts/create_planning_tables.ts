
import { getConnection } from '../src/connections/sql';

async function createPlanningTables() {
    console.log('Connecting to database...');
    let pool;
    try {
        pool = await getConnection();
        console.log('Connected.');

        // 1. ZONAS
        console.log('Creating Table: ZONAS...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ZONAS')
            BEGIN
                CREATE TABLE ZONAS (
                    id_zona INT IDENTITY(1,1) PRIMARY KEY,
                    nombre NVARCHAR(100) NOT NULL,
                    codigo NVARCHAR(20) NOT NULL
                );
                PRINT 'ZONAS created.';
            END
            ELSE PRINT 'ZONAS already exists.';
        `);

        // 2. PERFILES_TRABAJO
        console.log('Creating Table: PERFILES_TRABAJO...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PERFILES_TRABAJO')
            BEGIN
                CREATE TABLE PERFILES_TRABAJO (
                    id_perfil INT IDENTITY(1,1) PRIMARY KEY,
                    nombre NVARCHAR(100) NOT NULL
                );
                PRINT 'PERFILES_TRABAJO created.';
            END
            ELSE PRINT 'PERFILES_TRABAJO already exists.';
        `);

        // 3. CUADRILLA_DIARIA
        console.log('Creating Table: CUADRILLA_DIARIA...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CUADRILLA_DIARIA')
            BEGIN
                CREATE TABLE CUADRILLA_DIARIA (
                    id_cuadrilla NVARCHAR(50) PRIMARY KEY, -- Using UUID string from frontend
                    codigo NVARCHAR(20) NOT NULL,
                    fecha_operacion DATE NOT NULL,
                    estado_planificacion NVARCHAR(20) NOT NULL CHECK (estado_planificacion IN ('BORRADOR', 'PUBLICADO')),
                    
                    id_lider INT NOT NULL,
                    id_auxiliar INT NULL,
                    placa_vehiculo NVARCHAR(20) NOT NULL,
                    
                    id_zona INT NOT NULL,
                    id_perfil INT NOT NULL,
                    id_kit_materiales INT NOT NULL,
                    id_kit_documentos INT NOT NULL,
                    
                    fecha_creacion DATETIME DEFAULT GETDATE(),
                    fecha_publicacion DATETIME NULL,

                    CONSTRAINT FK_CUADRILLA_LIDER FOREIGN KEY (id_lider) REFERENCES COLABORADORES(id),
                    CONSTRAINT FK_CUADRILLA_AUXILIAR FOREIGN KEY (id_auxiliar) REFERENCES COLABORADORES(id),
                    CONSTRAINT FK_CUADRILLA_VEHICULO FOREIGN KEY (placa_vehiculo) REFERENCES VEHICULOS(placa),
                    CONSTRAINT FK_CUADRILLA_ZONA FOREIGN KEY (id_zona) REFERENCES ZONAS(id_zona),
                    CONSTRAINT FK_CUADRILLA_PERFIL FOREIGN KEY (id_perfil) REFERENCES PERFILES_TRABAJO(id_perfil)
                    -- Note: KITS tables FKs could be added if stricty needed, but kept loose 
                    -- for flexibility as Kits might change. But strict is better. 
                    -- Given CATALOGO_KITS primary key is id_kit (INT), let's link it.
                    -- Checking create_config_tables.ts: CATALOGO_KITS(id_kit INT), FORMATOS_PAPELERIA(id_formato INT)
                    -- But user schema calls it id_kit_documentos. Let's assume it links to another Kit table? 
                    -- In PlanningView it calls 'documentKits'. 
                    -- Let's check 'CATALOGO_KITS' content. It has 'tipo_servicio'. 
                    -- Maybe document kits are just CATALOGO_KITS?
                    -- Wait, previous 'documentKits' in supabase were separate?
                    -- Let's check PlanningView again.
                );
                PRINT 'CUADRILLA_DIARIA created.';
            END
            ELSE PRINT 'CUADRILLA_DIARIA already exists.';
        `);

        console.log('✅ Planning tables created successfully.');
        await pool.close();

    } catch (err) {
        console.error('Error creating tables:', err);
        process.exit(1);
    }
}

createPlanningTables();
