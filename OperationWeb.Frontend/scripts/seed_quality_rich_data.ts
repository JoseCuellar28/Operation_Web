
import sql from 'mssql';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'M1Password123!',
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'OperationsSmartDB',
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
};

const SAMPLE_CLIENTS = [
    { name: 'Juan Pérez', addr: 'Av. Larco 101, Miraflores', sector: 'MIRA-01' },
    { name: 'Maria Rodriguez', addr: 'Ca. Los Pinos 450, San Isidro', sector: 'SANI-02' },
    { name: 'Hospital Central', addr: 'Av. Grau 800, Lima', sector: 'LIMA-05' },
    { name: 'Banco Financiero', addr: 'Av. Pardo 200, Miraflores', sector: 'MIRA-03' },
    { name: 'Carlos Gomez', addr: 'Jr. Union 555, Barranco', sector: 'BARR-01' },
    { name: 'Ana Torres', addr: 'Av. Brasil 1500, Jesus Maria', sector: 'JESU-04' },
    { name: 'Tech Solutions SAC', addr: 'Av. Javier Prado 2020, San Borja', sector: 'SBOR-02' },
    { name: 'Luis Fernandez', addr: 'Ca. Alcanfores 123, Miraflores', sector: 'MIRA-02' }
];

const SAMPLE_IMG = [
    'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=600&q=80', // Tech
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80', // Cables
    'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=600&q=80', // Modem
    'https://images.unsplash.com/photo-1544724569-5f546fd6dd2d?w=600&q=80', // Worker
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80', // Server
    'https://images.unsplash.com/photo-1597733336794-12d05021d510?w=600&q=80'  // Router
];

const MATERIALS = ['CABLE-UTP', 'CONECTOR-RJ45', 'MODEM-HFC', 'DECO-HD', 'CABLE-FIBRA'];

async function seedRichQualityData() {
    let pool;
    try {
        pool = await sql.connect(config);

        console.log("💎 Seeding RICH Quality Data...");

        const todayStr = new Date().toISOString().split('T')[0];

        // 1. CLEANUP: Remove OTs created today to avoid mess
        console.log("🧹 Cleaning up old simulation data for today...");
        await pool.query(`
            DELETE FROM EVIDENCIAS WHERE CAST(fecha_carga AS DATE) = '${todayStr}';
            DELETE FROM CONSUMO_MATERIALES WHERE CAST(fecha_registro AS DATE) = '${todayStr}';
            DELETE FROM ORDENES_TRABAJO WHERE fecha_programada = '${todayStr}' AND flag_prioridad_calidad = 1;
        `);

        // 2. Get Active Crews
        const crews = await pool.query(`
            SELECT id_cuadrilla, placa_vehiculo 
            FROM CUADRILLA_DIARIA 
            WHERE fecha_operacion = '${todayStr}' 
            AND placa_vehiculo IS NOT NULL
        `);

        if (crews.recordset.length === 0) {
            console.log("⚠️ No active crews found.");
            return;
        }

        console.log(`📋 Assigning Rich Work Orders to ${crews.recordset.length} Crews...`);

        for (let i = 0; i < crews.recordset.length; i++) {
            const crew = crews.recordset[i];
            const client = SAMPLE_CLIENTS[i % SAMPLE_CLIENTS.length];
            const hasSurplus = i % 2 === 0; // Every other OT has surplus

            console.log(`   -> Generating OT for ${crew.placa_vehiculo} @ ${client.name}`);

            const otId = uuidv4();
            const code = `OT-${10000 + i + Math.floor(Math.random() * 900)}`;

            // Create OT
            await pool.request()
                .input('id', sql.UniqueIdentifier, otId)
                .input('code', sql.NVarChar, code)
                .input('client', sql.NVarChar, client.name)
                .input('addr', sql.NVarChar, client.addr)
                .input('sector', sql.NVarChar, client.sector)
                .input('crew', sql.NVarChar, crew.id_cuadrilla)
                .input('date', sql.Date, todayStr)
                .query(`
                    INSERT INTO ORDENES_TRABAJO (
                        id_ot, codigo_suministro, cliente, direccion_fisica, comuna, sector,
                        tipo_trabajo, estado, prioridad, id_lote_origen, fecha_programada,
                        id_cuadrilla_asignada, orden_visita, flag_prioridad_calidad
                    ) VALUES (
                        @id, @code, @client, @addr, 'LIMA', @sector,
                        'INSTALACION_PREMIUM', 'COMPLETADO', 'ALTA', 1, @date,
                        @crew, 1, 1
                    )
                `);

            // Add Evidences (3-4 photos)
            const numPhotos = 3 + Math.floor(Math.random() * 2);
            for (let j = 0; j < numPhotos; j++) {
                const img = SAMPLE_IMG[(i + j) % SAMPLE_IMG.length];
                const type = j === 0 ? 'PREVIO' : (j === numPhotos - 1 ? 'FINAL' : 'DURANTE');

                await pool.request()
                    .input('id', sql.UniqueIdentifier, uuidv4())
                    .input('otId', sql.UniqueIdentifier, otId)
                    .input('type', sql.NVarChar, type)
                    .input('url', sql.NVarChar, img)
                    .query(`
                        INSERT INTO EVIDENCIAS (
                            id_evidencia, id_ot, tipo_evidencia, url_archivo, timestamp_gps, fecha_carga
                        ) VALUES (
                            @id, @otId, @type, @url, GETDATE(), GETDATE()
                        )
                    `);
            }

            // Add Surplus (Excedente) if flag is true
            if (hasSurplus) {
                const mat = MATERIALS[i % MATERIALS.length];
                await pool.request()
                    .input('id', sql.UniqueIdentifier, uuidv4())
                    .input('otId', sql.UniqueIdentifier, otId)
                    .input('mat', sql.NVarChar, mat)
                    .query(`
                        INSERT INTO CONSUMO_MATERIALES (
                            id_consumo, id_ot, cod_material, cantidad, tipo_kardex, es_excedente, fecha_registro
                        ) VALUES (
                            @id, @otId, @mat, 2, 'CONSUMO', 1, GETDATE()
                        )
                    `);
                console.log(`      * Injected Surplus: 2x ${mat}`);
            }
        }

        console.log(`✅ Rich Data Seeded Successfully.`);

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        if (pool) await pool.close();
    }
}

seedRichQualityData();
