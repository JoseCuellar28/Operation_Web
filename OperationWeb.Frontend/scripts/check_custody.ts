
import sql from 'mssql';
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

async function checkCustodyMismatch() {
    let pool;
    try {
        pool = await sql.connect(config);

        console.log("🔍 Checking Custody Integrity...");

        // 1. Get ABC-123 Crew Details
        console.log("\n1. Crew 'ABC-123' Details from CUADRILLA_DIARIA:");
        const crew = await pool.query("SELECT id_cuadrilla, placa_vehiculo, fecha_operacion FROM CUADRILLA_DIARIA WHERE placa_vehiculo = 'ABC-123'");
        console.table(crew.recordset);

        if (crew.recordset.length > 0) {
            const id = crew.recordset[0].id_cuadrilla;
            const plate = crew.recordset[0].placa_vehiculo;

            // 2. Check Stock by PLATE
            console.log(`\n2. Stock Lookup by PLATE ('${plate}'):`);
            const stockPlate = await pool.query(`SELECT COUNT(*) as count, SUM(cantidad) as total_items FROM STOCK_CUSTODIA WHERE custodio_id = '${plate}'`);
            console.table(stockPlate.recordset);

            // 3. Check Stock by UUID (Just in case)
            console.log(`\n3. Stock Lookup by UUID ('${id}'):`);
            const stockUUID = await pool.query(`SELECT COUNT(*) as count, SUM(cantidad) as total_items FROM STOCK_CUSTODIA WHERE custodio_id = '${id}'`);
            console.table(stockUUID.recordset);

            if (stockPlate.recordset[0].count === 0 && stockUUID.recordset[0].count > 0) {
                console.log("⚠️ CRITICAL: Stock is stored by UUID, but Server looks up by PLATE!");
            } else if (stockPlate.recordset[0].count > 0) {
                console.log("✅ Stock is correctly stored by Plate.");
            } else {
                console.log("⚠️ No stock found for either Plate or UUID.");
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        if (pool) await pool.close();
    }
}

checkCustodyMismatch();
