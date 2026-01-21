
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

const SAMPLE_IMG = [
    'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=600&q=80', // Tech working
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80', // Cables
    'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=600&q=80', // Modem
    'https://images.unsplash.com/photo-1544724569-5f546fd6dd2d?w=600&q=80', // Worker
];

async function seedQualityData() {
    let pool;
    try {
        pool = await sql.connect(config);

        console.log("🏭 Seeding Quality Module Data...");

        // 1. Get Active Crews Today
        const todayStr = new Date().toISOString().split('T')[0];
        const crews = await pool.query(`
            SELECT id_cuadrilla, placa_vehiculo 
            FROM CUADRILLA_DIARIA 
            WHERE fecha_operacion = '${todayStr}' 
            AND placa_vehiculo IS NOT NULL
        `);

        if (crews.recordset.length === 0) {
            console.log("⚠️ No active crews found. Cannot assign work.");
            return;
        }

        console.log(`📋 Assigning Work to ${crews.recordset.length} Crews...`);

        let otCount = 0;
        let evCount = 0;

        for (const crew of crews.recordset) {
            console.log(`   -> Crew ${crew.placa_vehiculo}`);

            // A. Create "COMPLETED" OT (Ready for Audit)
            // Flag priority = 1 (System flagged it for quality review)
            const otId1 = uuidv4();
            await pool.request()
                .input('id', sql.UniqueIdentifier, otId1)
                .input('code', sql.NVarChar, `OT-${Math.floor(Math.random() * 10000)}`)
                .input('crew', sql.NVarChar, crew.id_cuadrilla)
                .input('date', sql.Date, todayStr)
                .query(`
                    INSERT INTO ORDENES_TRABAJO (
                        id_ot, codigo_suministro, cliente, direccion_fisica, comuna, sector,
                        tipo_trabajo, estado, prioridad, id_lote_origen, fecha_programada,
                        id_cuadrilla_asignada, orden_visita, flag_prioridad_calidad
                    ) VALUES (
                        @id, @code, 'Cliente Simulado 1', 'Av. Test 123', 'LIMA', 'SECTOR-1',
                        'INSTALACION', 'COMPLETADO', 'ALTA', 1, @date,
                        @crew, 1, 1
                    )
                `);
            otCount++;

            // Insert Evidence for OT 1
            await insertEvidence(pool, otId1, 'PREVIO');
            await insertEvidence(pool, otId1, 'FINAL');
            evCount += 2;

            // B. Create "IN PROGRESS" OT
            const otId2 = uuidv4();
            await pool.request()
                .input('id', sql.UniqueIdentifier, otId2)
                .input('code', sql.NVarChar, `OT-${Math.floor(Math.random() * 10000)}`)
                .input('crew', sql.NVarChar, crew.id_cuadrilla)
                .input('date', sql.Date, todayStr)
                .query(`
                    INSERT INTO ORDENES_TRABAJO (
                        id_ot, codigo_suministro, cliente, direccion_fisica, comuna, sector,
                        tipo_trabajo, estado, prioridad, id_lote_origen, fecha_programada,
                        id_cuadrilla_asignada, orden_visita, flag_prioridad_calidad
                    ) VALUES (
                        @id, @code, 'Cliente Simulado 2', 'Jr. Demo 456', 'LIMA', 'SECTOR-2',
                        'MANTENIMIENTO', 'EN_PROGRESO', 'MEDIA', 1, @date,
                        @crew, 2, 0
                    )
                `);
            otCount++;
        }

        console.log(`✅ Seed Complete.`);
        console.log(`   - Created ${otCount} Work Orders.`);
        console.log(`   - Created ${evCount} Evidence Records.`);

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        if (pool) await pool.close();
    }
}

async function insertEvidence(pool: any, otId: string, type: string) {
    const url = SAMPLE_IMG[Math.floor(Math.random() * SAMPLE_IMG.length)];
    const evId = uuidv4();
    await pool.request()
        .input('id', sql.UniqueIdentifier, evId)
        .input('otId', sql.UniqueIdentifier, otId)
        .input('type', sql.NVarChar, type)
        .input('url', sql.NVarChar, url)
        .query(`
            INSERT INTO EVIDENCIAS (
                id_evidencia, id_ot, tipo_evidencia, url_archivo, timestamp_gps, fecha_carga
            ) VALUES (
                @id, @otId, @type, @url, GETDATE(), GETDATE()
            )
        `);
}

seedQualityData();
