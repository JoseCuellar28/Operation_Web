
import axios from 'axios';
import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

const API_URL = 'http://localhost:3000/api/v1';

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

async function runStressTest() {
    let pool;
    let successCount = 0;
    let failCount = 0;
    const TOTAL_TESTS = 20;

    try {
        console.log(`🚀 STARTING STRESS TEST (${TOTAL_TESTS} Iterations)`);
        pool = await sql.connect(config);

        // 1. Setup: Ensure we have a crew with enough stock
        // We will target 'ABC-123' and ensure it has at least 30 items of 'CONECTOR'
        const matRes = await pool.query("SELECT TOP 1 id_material FROM CATALOGO_MATERIALES WHERE nombre LIKE '%CONECTOR%'");
        const materialId = matRes.recordset[0]?.id_material;

        // Ensure crew exists
        const crewRes = await pool.query("SELECT TOP 1 id_cuadrilla FROM CUADRILLA_DIARIA WHERE placa_vehiculo = 'ABC-123'");
        let crewId = crewRes.recordset[0]?.id_cuadrilla;

        if (!crewId) {
            console.error("❌ Vehicle ABC-123 not found in active crews. Running seed fix...");
            // Quick fix to ensure crew exists for test
            // This assumes seed was run, if not fail.
            return;
        }

        // Boost Stock for Test
        console.log("💉 Injecting test stock to ensure capacity...");
        await pool.query(`
            MERGE STOCK_CUSTODIA AS target
            USING (SELECT 'ABC-123' as custodio_id, '${materialId}' as id_material) AS source
            ON (target.custodio_id = source.custodio_id AND target.id_material = source.id_material)
            WHEN MATCHED THEN
                UPDATE SET cantidad = 50
            WHEN NOT MATCHED THEN
                INSERT (custodio_id, tipo_custodio, id_material, cantidad) VALUES ('ABC-123', 'VEHICULO', '${materialId}', 50);
        `);

        // 2. Loop
        for (let i = 1; i <= TOTAL_TESTS; i++) {
            const isGood = i % 2 !== 0; // Odd = Good, Even = Bad
            const status = isGood ? 'BUENO' : 'MALO'; // Note: Frontend sends BUENO/MALO, Backend maps to DB types
            const qty = 1;

            console.log(`\n🔹 Test #${i}: Returning 1 Unit (${status})...`);

            try {
                // Get State Before
                const stockBefore = await pool.query(`SELECT cantidad FROM STOCK_ALMACEN WHERE id_material = '${materialId}'`);
                const initialWarehouse = stockBefore.recordset[0]?.cantidad || 0;

                // Execute API
                const payload = {
                    id_cuadrilla: crewId,
                    items: [{ id_material: materialId, cantidad: qty, estado: status }]
                };

                await axios.post(`${API_URL}/logistics/return`, payload);

                // Verify
                const stockAfter = await pool.query(`SELECT cantidad FROM STOCK_ALMACEN WHERE id_material = '${materialId}'`);
                const finalWarehouse = stockAfter.recordset[0]?.cantidad || 0;

                // Check Logic
                if (status === 'BUENO') {
                    if (finalWarehouse === initialWarehouse + qty) {
                        console.log(`   ✅ Success: Warehouse increased (Current: ${finalWarehouse})`);
                        successCount++;
                    } else {
                        console.error(`   ❌ Fail: Warehouse did not increase correctly.`);
                        failCount++;
                    }
                } else {
                    // MALO -> Should NOT increase usable stock (based on current implementation? 
                    // WAIT: My backend implementation for 'RETORNO_CHATARRA' did NOT include the UPDATE STOCK_ALMACEN block.
                    // So warehouse stock should remain same.
                    if (finalWarehouse === initialWarehouse) {
                        console.log(`   ✅ Success: Bad item returned, Warehouse stock unchanged (Correct).`);
                        successCount++;
                    } else {
                        console.error(`   ❌ Fail: Warehouse changed unexpectedly for Bad item.`);
                        failCount++;
                    }
                }

            } catch (error: any) {
                console.error(`   ❌ API/DB Error:`, error.response?.data || error.message);
                failCount++;
            }
        }

        console.log('\n==========================================');
        console.log('📊 DIAGNOSTIC REPORT');
        console.log('==========================================');
        console.log(`Total Tests Run: ${TOTAL_TESTS}`);
        console.log(`✅ Passed:       ${successCount}`);
        console.log(`❌ Failed:       ${failCount}`);
        console.log('==========================================');

        if (failCount === 0) {
            console.log('RESULT: SYSTEM IS STABLE 🟢');
        } else {
            console.log('RESULT: SYSTEM HAS ISSUES 🔴');
        }

    } catch (err) {
        console.error('Fatal Error:', err);
    } finally {
        if (pool) await pool.close();
    }
}

runStressTest();
