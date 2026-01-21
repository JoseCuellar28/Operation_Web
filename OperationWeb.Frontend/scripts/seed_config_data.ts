import { getConnection } from '../src/connections/sql';

async function seedData() {
    console.log('🌱 Seeding Configuration Data...');
    let pool;
    try {
        pool = await getConnection();

        // 1. Seed CATALOGO_MATERIALES
        console.log('Inserting Materials...');
        const materials = [
            { nombre: 'Cable UTP Cat6', tipo: 'CONSUMIBLE', unidad: 'MTR', costo: 1.50 },
            { nombre: 'Conector RJ45', tipo: 'CONSUMIBLE', unidad: 'UND', costo: 0.50 },
            { nombre: 'Decodificador HD', tipo: 'ACTIVO', unidad: 'UND', costo: 120.00 },
            { nombre: 'Modem HFC', tipo: 'ACTIVO', unidad: 'UND', costo: 150.00 },
            { nombre: 'Precinto de Seguridad', tipo: 'CONSUMIBLE', unidad: 'UND', costo: 0.10 },
            { nombre: 'Taladro Percutor', tipo: 'ACTIVO', unidad: 'UND', costo: 350.00 },
            { nombre: 'Escalera Telescópica', tipo: 'ACTIVO', unidad: 'UND', costo: 450.00 },
            { nombre: 'Cinta Aislante', tipo: 'CONSUMIBLE', unidad: 'UND', costo: 2.50 },
            { nombre: 'Grapas Coaxiales', tipo: 'CONSUMIBLE', unidad: 'CJA', costo: 5.00 },
            { nombre: 'Splitter 1x2', tipo: 'CONSUMIBLE', unidad: 'UND', costo: 3.00 }
        ];

        for (const m of materials) {
            await pool.request().query(`
                INSERT INTO CATALOGO_MATERIALES (nombre, tipo, unidad_medida, costo_unitario)
                SELECT '${m.nombre}', '${m.tipo}', '${m.unidad}', ${m.costo}
                WHERE NOT EXISTS (SELECT 1 FROM CATALOGO_MATERIALES WHERE nombre = '${m.nombre}')
            `);
        }
        console.log('✅ Materials seeded.');

        // 2. Seed VEHICULOS
        console.log('Inserting Vehicles...');
        const vehicles = [
            { placa: 'ABC-123', marca: 'Toyota Hilux', tipo: 'CAMIONETA', vol: 'ALTO' },
            { placa: 'XYZ-987', marca: 'Honda XR150', tipo: 'MOTO', vol: 'BAJO' },
            { placa: 'DEF-456', marca: 'Hyundai H1', tipo: 'MINIVAN', vol: 'ALTO' },
            { placa: 'GHI-789', marca: 'Nissan Frontier', tipo: 'CAMIONETA', vol: 'ALTO' },
            { placa: 'JKL-012', marca: 'Yamaha FZ', tipo: 'MOTO', vol: 'BAJO' },
            { placa: 'MNO-345', marca: 'Kia K2700', tipo: 'CAMIONETA', vol: 'ALTO' },
            { placa: 'PQR-678', marca: 'Suzuki Gixxer', tipo: 'MOTO', vol: 'BAJO' },
            { placa: 'STU-901', marca: 'Chevrolet N400', tipo: 'MINIVAN', vol: 'ALTO' },
            { placa: 'VWX-234', marca: 'Mitsubishi L200', tipo: 'CAMIONETA', vol: 'ALTO' },
            { placa: 'YZA-567', marca: 'Bajaj Pulsar', tipo: 'MOTO', vol: 'BAJO' }
        ];

        for (const v of vehicles) {
            await pool.request().query(`
                IF NOT EXISTS (SELECT 1 FROM VEHICULOS WHERE placa = '${v.placa}')
                INSERT INTO VEHICULOS (placa, marca, tipo_activo, max_volumen, estado)
                VALUES ('${v.placa}', '${v.marca}', '${v.tipo}', '${v.vol}', 'OPERATIVO')
            `);
        }
        console.log('✅ Vehicles seeded.');

        // 3. Seed CATALOGO_KITS
        // First get some material IDs for JSON reference
        const matResult = await pool.request().query("SELECT TOP 3 id_material, nombre FROM CATALOGO_MATERIALES");
        const mats = matResult.recordset;

        if (mats.length > 0) {
            console.log('Inserting Kits...');

            // Construct JSON for Kit 1
            const kit1Items = [
                { materialId: mats[0].id_material, nombre: mats[0].nombre, cantidad: 50, destinoCustodia: 'DNI' },
                { materialId: mats[1].id_material, nombre: mats[1].nombre, cantidad: 100, destinoCustodia: 'DNI' }
            ];
            const kit1Json = JSON.stringify(kit1Items);

            // Construct JSON for Kit 2
            const kit2Items = [
                { materialId: mats[0].id_material, nombre: mats[0].nombre, cantidad: 10, destinoCustodia: 'PLACA' }
            ];
            const kit2Json = JSON.stringify(kit2Items);

            await pool.request().query(`
                IF NOT EXISTS (SELECT 1 FROM CATALOGO_KITS WHERE nombre_kit = 'Kit Instalación HFC')
                INSERT INTO CATALOGO_KITS (nombre_kit, tipo_servicio, composicion_kit)
                VALUES ('Kit Instalación HFC', 'INSTALACION', '${kit1Json}')
            `);

            await pool.request().query(`
                IF NOT EXISTS (SELECT 1 FROM CATALOGO_KITS WHERE nombre_kit = 'Kit Mantenimiento Básico')
                INSERT INTO CATALOGO_KITS (nombre_kit, tipo_servicio, composicion_kit)
                VALUES ('Kit Mantenimiento Básico', 'MANTENIMIENTO', '${kit2Json}')
            `);
            console.log('✅ Kits seeded.');
        }

        // 4. Seed FORMATOS_PAPELERIA
        console.log('Inserting Formats...');
        const formats = [
            { nombre: 'Acta de Instalación', control: 1, ini: 1000, fin: 5000 },
            { nombre: 'Checklist Vehicular', control: 0, ini: 'NULL', fin: 'NULL' },
            { nombre: 'Boleta de Visita', control: 1, ini: 100, fin: 500 }
        ];

        for (const f of formats) {
            await pool.request().query(`
                IF NOT EXISTS (SELECT 1 FROM FORMATOS_PAPELERIA WHERE nombre = '${f.nombre}')
                INSERT INTO FORMATOS_PAPELERIA (nombre, control_series, rango_inicio, rango_fin)
                VALUES ('${f.nombre}', ${f.control}, ${f.ini}, ${f.fin})
            `);
        }
        console.log('✅ Formats seeded.');

        await pool.close();
        console.log('🎉 All Data Seeded Successfully!');

    } catch (err) {
        console.error('❌ Error seeding data:', err);
        process.exit(1);
    }
}

seedData();
