
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

async function verifyReturns() {
    let pool;
    try {
        console.log('--- STARTING RETURN VERIFICATION ---');

        // 1. Setup: Get a crew/vehicle that HAS stock (ABC-123 from previous seed)
        // We know ABC-123 has ~25 Connectors (Material ID from seed)
        pool = await sql.connect(config);

        // Find the material ID for "CONECTOR" (or whatever was seeded)
        const matRes = await pool.query("SELECT TOP 1 id_material FROM CATALOGO_MATERIALES WHERE nombre LIKE '%CONECTOR%'");
        const materialId = matRes.recordset[0]?.id_material;

        console.log(`Target Material ID: ${materialId}`);

        // Get Initial State
        const stockBefore = await pool.query(`SELECT cantidad FROM STOCK_ALMACEN WHERE id_material = '${materialId}'`);
        const custodyBefore = await pool.query(`SELECT cantidad FROM STOCK_CUSTODIA WHERE custodio_id = 'ABC-123' AND id_material = '${materialId}'`);

        const initialWarehouse = stockBefore.recordset[0]?.cantidad || 0;
        const initialCustody = custodyBefore.recordset[0]?.cantidad || 0;

        console.log(`Initial State -> Warehouse: ${initialWarehouse}, Custody (ABC-123): ${initialCustody}`);

        if (initialCustody === 0) {
            console.warn("Skipping test: ABC-123 has no custody stock to return. Please run seed first or manually add stock.");
            return;
        }

        // 2. Execute Return via API
        // We need a valid 'id_cuadrilla' that corresponds to vehicle 'ABC-123'.
        // Let's find one or use a dummy if the API only needs it for validation not keying (the backend uses the vehicle plate from the crew)
        const crewRes = await pool.query("SELECT TOP 1 id_cuadrilla FROM CUADRILLA_DIARIA WHERE placa_vehiculo = 'ABC-123'");
        const crewId = crewRes.recordset[0]?.id_cuadrilla;

        if (!crewId) {
            console.warn("Skipping test: No active crew found for vehicle ABC-123 to link the return.");
            return;
        }

        console.log(`Returning 5 units from Crew ${crewId} (ABC-123)...`);

        const payload = {
            id_cuadrilla: crewId,
            items: [
                { id_material: materialId, cantidad: 5, estado: 'BUENO' }
            ]
        };

        const apiRes = await axios.post(`${API_URL}/logistics/return`, payload);
        console.log('API Response:', apiRes.data);

        // 3. Verify Final State
        const stockAfter = await pool.query(`SELECT cantidad FROM STOCK_ALMACEN WHERE id_material = '${materialId}'`);
        const custodyAfter = await pool.query(`SELECT cantidad FROM STOCK_CUSTODIA WHERE custodio_id = 'ABC-123' AND id_material = '${materialId}'`);

        const finalWarehouse = stockAfter.recordset[0]?.cantidad || 0;
        const finalCustody = custodyAfter.recordset[0]?.cantidad || 0;

        console.log(`Final State   -> Warehouse: ${finalWarehouse}, Custody (ABC-123): ${finalCustody}`);

        // Assertions
        const warehouseDiff = finalWarehouse - initialWarehouse;
        const custodyDiff = initialCustody - finalCustody;

        if (warehouseDiff === 5 && custodyDiff === 5) {
            console.log('✅ TEST PASSED: Stock moved correctly from Custody to Warehouse.');
        } else {
            console.error('❌ TEST FAILED: Stock mismatch.');
            console.error(`Expected Warehouse +5, got ${warehouseDiff}`);
            console.error(`Expected Custody -5, got ${custodyDiff}`);
        }

        // 4. Verify Movement Log
        const movRes = await pool.query(`
            SELECT TOP 1 * FROM MOVIMIENTOS_ALMACEN 
            WHERE tipo_movimiento = 'DEVOLUCION_BUEN_ESTADO' 
            AND id_material = '${materialId}' 
            ORDER BY fecha DESC
        `);

        if (movRes.recordset.length > 0) {
            console.log('✅ TEST PASSED: Movement log found:', movRes.recordset[0].documento_ref);
        } else {
            console.error('❌ TEST FAILED: No movement log found.');
        }

    } catch (err) {
        console.error('Test Execution Failed:', err);
    } finally {
        if (pool) await pool.close();
    }
}

verifyReturns();
