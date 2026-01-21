
import { getConnection } from '../src/connections/sql';

async function seedPlanningCatalogs() {
    console.log('🌱 Seeding Planning Catalogs...');
    let pool;
    try {
        pool = await getConnection();

        // 1. Seed ZONAS
        console.log('Inserting Default Zones...');
        const zones = [
            { nombre: 'Zona Norte', codigo: 'ZN-01' },
            { nombre: 'Zona Sur', codigo: 'ZS-01' },
            { nombre: 'Zona Este', codigo: 'ZE-01' },
            { nombre: 'Zona Oeste', codigo: 'ZO-01' },
            { nombre: 'Zona Centro', codigo: 'ZC-01' }
        ];

        for (const z of zones) {
            await pool.request().query(`
                IF NOT EXISTS (SELECT 1 FROM ZONAS WHERE nombre = '${z.nombre}')
                INSERT INTO ZONAS (nombre, codigo) VALUES ('${z.nombre}', '${z.codigo}')
            `);
        }
        console.log('✅ Zones seeded.');

        // 2. Seed PERFILES_TRABAJO
        console.log('Inserting Default Work Profiles...');
        const profiles = [
            'Instalación HFC',
            'Instalación FTTH',
            'Mantenimiento HFC',
            'Mantenimiento FTTH',
            'Postventa',
            'Averías'
        ];

        for (const p of profiles) {
            await pool.request().query(`
                IF NOT EXISTS (SELECT 1 FROM PERFILES_TRABAJO WHERE nombre = '${p}')
                INSERT INTO PERFILES_TRABAJO (nombre) VALUES ('${p}')
            `);
        }
        console.log('✅ Work Profiles seeded.');

        await pool.close();
        console.log('🎉 Planning Catalogs Seeded Successfully!');

    } catch (err) {
        console.error('❌ Error seeding planning catalogs:', err);
        process.exit(1);
    }
}

seedPlanningCatalogs();
