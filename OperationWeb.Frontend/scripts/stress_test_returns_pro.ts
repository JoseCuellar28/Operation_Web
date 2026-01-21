
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

async function runExtendedStressTest() {
    let pool;
    let successCount = 0;
    let failCount = 0;
    const TOTAL_TESTS = 50;
    const TARGET_MATERIAL_NAME = 'CONECTOR'; // Must exist in catalog

    try {
        console.log(`🚀 STARTING EXTENDED STRESS TEST (${TOTAL_TESTS} Iterations)`);
        pool = await sql.connect(config);

        // 1. Setup: Ensure we have a crew with enough stock
        const matRes = await pool.query(`SELECT TOP 1 id_material FROM CATALOGO_MATERIALES WHERE nombre LIKE '%${TARGET_MATERIAL_NAME}%'`);
        const materialId = matRes.recordset[0]?.id_material;

        // Ensure crew exists (Using ABC-123 or whatever is active)
        const crewRes = await pool.query("SELECT TOP 1 id_cuadrilla, placa_vehiculo FROM CUADRILLA_DIARIA WHERE fecha_operacion = CAST(GETDATE() AS DATE) AND placa_vehiculo IS NOT NULL");

        if (crewRes.recordset.length === 0) {
            console.error("❌ No active crew found for TODAY. Please ensure at least one crew is scheduled.");
            return;
        }

        const crewId = crewRes.recordset[0].id_cuadrilla;
        const plate = crewRes.recordset[0].placa_vehiculo;
        console.log(`🎯 Targeting Crew: ${plate} (${crewId})`);

        // Force High Stock for Testing
        console.log("💉 Injecting massive test stock (500 units)...");
        await pool.query(`
            MERGE STOCK_CUSTODIA AS target
            USING (SELECT '${plate}' as custodio_id, '${materialId}' as id_material) AS source
            ON (target.custodio_id = source.custodio_id AND target.id_material = source.id_material)
            WHEN MATCHED THEN
                UPDATE SET cantidad = 500
            WHEN NOT MATCHED THEN
                INSERT (custodio_id, tipo_custodio, id_material, cantidad) VALUES ('${plate}', 'VEHICULO', '${materialId}', 500);
        `);

        // 2. Loop 50 Times with Random Scenarios
        for (let i = 1; i <= TOTAL_TESTS; i++) {
            const scenario = Math.floor(Math.random() * 4); // 0, 1, 2, 3
            // 0: Standard Good Return
            // 1: Standard Bad Return
            // 2: Mixed Return (1 Good, 1 Bad)
            // 3: Invalid Over-Return (Try to return 1000)

            console.log(`\n🔹 Test #${i} [Scenario ${scenario}]:`);

            try {
                // Get State Before
                const stockBefore = await pool.query(`SELECT cantidad FROM STOCK_ALMACEN WHERE id_material = '${materialId}'`);
                const custStockBefore = await pool.query(`SELECT cantidad FROM STOCK_CUSTODIA WHERE custodio_id = '${plate}' AND id_material = '${materialId}'`);

                const whStart = stockBefore.recordset[0]?.cantidad || 0;
                const custStart = custStockBefore.recordset[0]?.cantidad || 0;

                let payload;

                if (scenario === 3) {
                    // 🔴 Scenario 3: Over-return (Should Fail)
                    console.log(`   Trying to return 1000 units (Owned: ${custStart})...`);
                    payload = {
                        id_cuadrilla: crewId,
                        items: [{ id_material: materialId, cantidad: 1000, estado: 'BUENO' }]
                    };
                } else if (scenario === 2) {
                    // 🟡 Scenario 2: Mixed
                    console.log(`   Returning 1 Good + 1 Bad...`);
                    payload = {
                        id_cuadrilla: crewId,
                        items: [
                            { id_material: materialId, cantidad: 1, estado: 'BUENO' },
                            { id_material: materialId, cantidad: 1, estado: 'MALO' }
                        ]
                    };
                } else {
                    // 🟢 Standard Single Item
                    const status = scenario === 0 ? 'BUENO' : 'MALO';
                    console.log(`   Returning 1 Unit (${status})...`);
                    payload = {
                        id_cuadrilla: crewId,
                        items: [{ id_material: materialId, cantidad: 1, estado: status }]
                    };
                }

                // EXECUTE API
                await axios.post(`${API_URL}/logistics/return`, payload);

                // Re-Check DB State
                const stockAfter = await pool.query(`SELECT cantidad FROM STOCK_ALMACEN WHERE id_material = '${materialId}'`);
                const custStockAfter = await pool.query(`SELECT cantidad FROM STOCK_CUSTODIA WHERE custodio_id = '${plate}' AND id_material = '${materialId}'`);

                const whEnd = stockAfter.recordset[0]?.cantidad || 0;
                const custEnd = custStockAfter.recordset[0]?.cantidad || 0;

                // VALIDATION LOGIC
                if (scenario === 3) {
                    // Should have Failed or Clamped? 
                    // Expected behavior: Likely Database Check Constraint prevents negative stock? 
                    // OR Application Logic check. If API succeeded but DB shows negative, that's a FAIL.
                    if (custEnd < 0) {
                        console.error(`   ❌ FAIL: Stock went negative! (${custEnd})`);
                        failCount++;
                    } else if (custEnd === custStart) {
                        console.log(`   ✅ PASS: Transaction rejected (Stock unchanged).`); // Ideally checking for 400 error catch block
                        successCount++;
                    } else {
                        // It accepted it? Weird if we don't have enough.
                        // Actually I injected 500, so 1000 is > 500.
                        // If it let me return 1000 and custody became -500, that is a huge bug.
                        console.error(`   ❌ FAIL: Allowed over-return! Custody: ${custEnd}`);
                        failCount++;
                    }
                } else if (scenario === 2) {
                    // Mixed: 1 Good (Warehouse +1), 1 Bad (Warehouse +0) -> Total Custody -2
                    if (whEnd === whStart + 1 && custEnd === custStart - 2) {
                        console.log(`   ✅ PASS: Mixed batch processed correctly.`);
                        successCount++;
                    } else {
                        console.error(`   ❌ FAIL: Logic error. Warehouse Delta: ${whEnd - whStart} (Exp: +1), Custody Delta: ${custEnd - custStart} (Exp: -2)`);
                        failCount++;
                    }
                } else {
                    // Standard
                    const isGood = scenario === 0;
                    if (isGood) {
                        if (whEnd === whStart + 1 && custEnd === custStart - 1) {
                            console.log(`   ✅ PASS: Good return OK.`);
                            successCount++;
                        } else {
                            console.error(`   ❌ FAIL: Good return logic mismatch.`);
                            failCount++;
                        }
                    } else {
                        // Bad
                        if (whEnd === whStart && custEnd === custStart - 1) {
                            console.log(`   ✅ PASS: Bad return OK (Scrapped).`);
                            successCount++;
                        } else {
                            console.error(`   ❌ FAIL: Bad return logic mismatch.`);
                            failCount++;
                        }
                    }
                }

            } catch (error: any) {
                // If we expected a failure (Scenario 3), this is good.
                if (scenario === 3) { // 3 = Over return
                    console.log(`   ✅ PASS: System correctly rejected invalid request. (${error.response?.data?.error || error.message})`);
                    successCount++;
                } else {
                    console.error(`   ❌ UNEXPECTED API ERROR:`, error.response?.data || error.message);
                    failCount++;
                }
            }
        }

        console.log('\n==========================================');
        console.log('📊 EXTENDED TEST RESULTS');
        console.log('==========================================');
        console.log(`Total Tests: ${TOTAL_TESTS}`);
        console.log(`✅ Success:  ${successCount}`);
        console.log(`❌ Failures: ${failCount}`);
        console.log('==========================================');

    } catch (err) {
        console.error('Fatal Test Error:', err);
    } finally {
        if (pool) await pool.close();
    }
}

runExtendedStressTest();
