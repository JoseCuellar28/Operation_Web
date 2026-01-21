import { getConnection } from '../src/connections/sql';
import sql from 'mssql';

async function mockLiquidationData() {
    console.log('Inserting 24 Mock Liquidation Records (Profit, Loss, Extemp)...');
    let pool: sql.ConnectionPool | undefined;
    try {
        pool = await getConnection();

        // 1. Get a Crew ID
        const crewRes = await pool.request().query("SELECT TOP 1 id_cuadrilla FROM CUADRILLA_DIARIA");
        const crewId = crewRes.recordset[0]?.id_cuadrilla;

        // Helper to generate OT
        const insertOT = async (i: number, type: 'PROFIT' | 'LOSS' | 'EXTEMP') => {
            // Fix: Ensure last segment is 12 chars. 
            // i=1 -> 1000000000001 (13 digits) -> slice(-12) gets last 12 digits
            const suffix = (1000000000000 + i).toString().slice(-12);
            const id = `00000000-0000-0000-0006-${suffix}`;
            // example 00000000-0000-0000-0006-000000000001

            const supplyCode = `SUM-LIQ-${1000 + i}`;
            const client = i % 2 === 0 ? 'Calidda' : 'Luz del Sur';
            const daysAgo = type === 'EXTEMP' ? (40 + i) : (Math.floor(Math.random() * 20));

            if (!pool) return;
            // Delete existing
            await pool.request().query(`DELETE FROM ORDENES_TRABAJO WHERE id_ot = '${id}'`);

            // Insert OT
            if (pool) await pool.request().query(`
                INSERT INTO ORDENES_TRABAJO (
                    id_ot, codigo_suministro, cliente, direccion_fisica,
                    estado, hora_inicio_real, hora_fin_real, id_cuadrilla_asignada,
                    fecha_programada, tipo_trabajo, latitud, longitud,
                    flag_prioridad_calidad, id_lote_origen,
                    flag_extemporanea, justificacion_tardia
                ) VALUES (
                    '${id}', '${supplyCode}', 
                    '${client}', 
                    'Avenida Las Pruebas ${i}',
                    'VALIDADA_OK', 
                    DATEADD(DAY, -${daysAgo}, GETDATE()), 
                    DATEADD(DAY, -${daysAgo}, DATEADD(HOUR, 2, GETDATE())), 
                    '${crewId}',
                    DATEADD(DAY, -${daysAgo}, GETDATE()), 
                    '${i % 3 === 0 ? 'MANTENIMIENTO' : 'INSTALACION'}', 
                    -12.00, -77.00,
                    0, 1,
                    ${type === 'EXTEMP' ? 1 : 0},
                    ${type === 'EXTEMP' ? "'Sincronización tardía de tablet'" : "NULL"}
                )
            `);

            // Insert Materials
            // If LOSS -> Use 'CABLE-COSTOSO' (Triggering server logic Cost=20)
            const matCode = type === 'LOSS' ? 'CABLE-COSTOSO-RG6' : 'CABLE-STD-RG6';
            const qty = 50 + (i * 2); // Randomish quantity

            if (pool) await pool.request().query(`
                DELETE FROM CONSUMO_MATERIALES WHERE id_ot = '${id}';
                INSERT INTO CONSUMO_MATERIALES (id_ot, cod_material, cantidad, tipo_kardex, es_excedente)
                VALUES ('${id}', '${matCode}', ${qty}, 'INSTALADO', 0)
            `);
        };

        // Generate 24 records
        for (let i = 1; i <= 24; i++) {
            let type: 'PROFIT' | 'LOSS' | 'EXTEMP' = 'PROFIT';
            if (i % 6 === 0) type = 'LOSS';     // Every 6th is Loss
            if (i % 7 === 0) type = 'EXTEMP';   // Every 7th is Extemporaneous

            await insertOT(i, type);
            process.stdout.write('.');
        }

        console.log('\nMock Liquidation Data Inserted Successfully!');

    } catch (err) {
        console.error('Error creating mock liquidation data:', err);
    } finally {
        if (pool) await pool.close();
    }
}

mockLiquidationData();
