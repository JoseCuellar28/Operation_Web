
import { getConnection } from '../src/connections/sql';

async function alterWorkProfiles() {
    console.log('Connecting to database...');
    try {
        const pool = await getConnection();
        console.log('Connected.');

        console.log('Altering PERFILES_TRABAJO table...');

        // Add id_kit_material column if it doesn't exist
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PERFILES_TRABAJO') AND name = 'id_kit_material')
            BEGIN
                ALTER TABLE PERFILES_TRABAJO ADD id_kit_material INT NULL;
                PRINT 'Column id_kit_material added.';
            END
            ELSE PRINT 'Column id_kit_material already exists.';
        `);

        // Add id_kit_documento column if it doesn't exist
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PERFILES_TRABAJO') AND name = 'id_kit_documento')
            BEGIN
                ALTER TABLE PERFILES_TRABAJO ADD id_kit_documento INT NULL;
                PRINT 'Column id_kit_documento added.';
            END
            ELSE PRINT 'Column id_kit_documento already exists.';
        `);

        // Add Foreign Keys (Optional but good for integrity)
        // We need to be careful if CATALOGO_KITS or FORMATOS_PAPELERIA are recreated often, but let's assume stability.
        // Assuming CATALOGO_KITS(id_kit) and FORMATOS_PAPELERIA(id_formato) exist.

        // Linking to CATALOGO_KITS
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_PERFIL_KIT_MATERIAL')
            BEGIN
                -- Check if constraint matches existing types
                ALTER TABLE PERFILES_TRABAJO ADD CONSTRAINT FK_PERFIL_KIT_MATERIAL FOREIGN KEY (id_kit_material) REFERENCES CATALOGO_KITS(id_kit);
                PRINT 'FK_PERFIL_KIT_MATERIAL created.';
            END
            ELSE PRINT 'FK_PERFIL_KIT_MATERIAL already exists.';
        `);

        // Linking to FORMATOS_PAPELERIA (which seems to use id_formato)
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_PERFIL_KIT_DOCUMENTO')
            BEGIN
                 ALTER TABLE PERFILES_TRABAJO ADD CONSTRAINT FK_PERFIL_KIT_DOCUMENTO FOREIGN KEY (id_kit_documento) REFERENCES FORMATOS_PAPELERIA(id_formato);
                 PRINT 'FK_PERFIL_KIT_DOCUMENTO created.';
            END
            ELSE PRINT 'FK_PERFIL_KIT_DOCUMENTO already exists.';
        `);

        console.log('✅ PERFILES_TRABAJO altered successfully.');
        await pool.close();

    } catch (err) {
        console.error('Error altering table:', err);
        process.exit(1);
    }
}

alterWorkProfiles();
