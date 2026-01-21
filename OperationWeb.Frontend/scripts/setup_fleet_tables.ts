
import { getConnection, sql } from '../src/connections/sql';

async function setupFleetTables() {
    try {
        console.log('Setup Fleet Control Tables...');
        const pool = await getConnection();

        // 1. Update VEHICULOS Table
        console.log('Updating VEHICULOS...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('VEHICULOS') AND name = 'ultimo_km_registrado')
                ALTER TABLE VEHICULOS ADD ultimo_km_registrado INT DEFAULT 0;

            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('VEHICULOS') AND name = 'proximo_mant_km')
                ALTER TABLE VEHICULOS ADD proximo_mant_km INT DEFAULT 5000;
        `);

        // 2. Create REGISTRO_VEHICULAR Table
        console.log('Creating REGISTRO_VEHICULAR...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'REGISTRO_VEHICULAR')
            BEGIN
                CREATE TABLE REGISTRO_VEHICULAR (
                    id_registro INT IDENTITY(1,1) PRIMARY KEY,
                    placa NVARCHAR(50) NOT NULL,
                    fecha_registro DATETIME DEFAULT GETDATE(),
                    tipo_evento NVARCHAR(50) NOT NULL, -- CHECKIN, CHECKOUT, MANTENIMIENTO
                    kilometraje INT NOT NULL,
                    checklist_data NVARCHAR(MAX), -- JSON with checklist results
                    conductor NVARCHAR(100),
                    observaciones NVARCHAR(MAX)
                );
                
                -- FK is optional depending on strictness, adding index for performance
                CREATE INDEX IDX_REGISTRO_PLACA ON REGISTRO_VEHICULAR(placa);
                PRINT 'Table REGISTRO_VEHICULAR created.';
            END
        `);

        console.log('Fleet Control Tables Ready.');
        process.exit(0);

    } catch (error) {
        console.error('Error setting up fleet tables:', error);
        process.exit(1);
    }
}

setupFleetTables();
