
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

async function checkTestData() {
    let pool;
    try {
        pool = await sql.connect(config);

        console.log("🔍 Checking Test Data Availability...\n");

        // 1. Check Active Crews for TODAY
        const crews = await pool.query(`
            SELECT id_cuadrilla, placa_vehiculo, fecha_operacion, estado_planificacion 
            FROM CUADRILLA_DIARIA 
            WHERE CAST(fecha_operacion AS DATE) = CAST(GETDATE() AS DATE)
        `);
        console.log(`🚛 Crews Scheduled for TODAY (${crews.recordset.length}):`);
        if (crews.recordset.length > 0) {
            console.table(crews.recordset);
        } else {
            console.log("   ❌ NO CREWS FOUND FOR TODAY. Valid dates found in DB:");
            const dates = await pool.query("SELECT DISTINCT TOP 5 fecha_operacion FROM CUADRILLA_DIARIA ORDER BY fecha_operacion DESC");
            console.table(dates.recordset);
        }

        // 2. Check Stock for the first found crew
        if (crews.recordset.length > 0) {
            const crewId = crews.recordset[0].placa_vehiculo; // Custody uses Plate usually
            const stock = await pool.query(`
                SELECT TOP 5 m.nombre, sc.cantidad, sc.tipo_custodio 
                FROM STOCK_CUSTODIA sc
                JOIN CATALOGO_MATERIALES m ON sc.id_material = m.id_material
                WHERE sc.custodio_id = '${crewId}'
            `);
            console.log(`\n📦 Stock Sample for Crew ${crewId} (${stock.recordset.length} items found):`);
            if (stock.recordset.length > 0) {
                console.table(stock.recordset);
            } else {
                console.log("   ⚠️ This crew has NO stock assigned.");
            }
        }

        // 3. Materials Catalog
        const materials = await pool.query("SELECT COUNT(*) as count FROM CATALOGO_MATERIALES");
        console.log(`\n📚 Materials in Catalog: ${materials.recordset[0].count}`);

    } catch (err) {
        console.error(err);
    } finally {
        if (pool) await pool.close();
    }
}

checkTestData();
