
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

async function forceSeedCustody() {
    let poolConnection;
    try {
        poolConnection = await sql.connect(config);
        console.log('Connected to DB');

        // 1. Get a common material ID (e.g., Connector or Cable)
        const matRes = await poolConnection.request().query("SELECT TOP 1 id_material FROM CATALOGO_MATERIALES WHERE nombre LIKE '%CONECTOR%'");
        const id_material = matRes.recordset[0]?.id_material;

        if (!id_material) throw new Error("No material found");

        // 2. Insert Custody for vehicle ABC-123 (from demo)
        // Clean up previous attempts if any
        await poolConnection.request().query(`
            DELETE FROM STOCK_CUSTODIA WHERE custodio_id = 'ABC-123' AND id_material = '${id_material}'
        `);

        // Insert 25 units present using CORRECT columns
        // Columns: custodio_id, tipo_custodio, id_material, cantidad, ultima_actualizacion
        await poolConnection.request().query(`
            INSERT INTO STOCK_CUSTODIA (custodio_id, tipo_custodio, id_material, cantidad, ultima_actualizacion)
            VALUES ('ABC-123', 'VEHICULO', '${id_material}', 25, GETDATE())
        `);

        console.log(`Seeded 25 units of ${id_material} to ABC-123 (custodio_id)`);

    } catch (err) {
        console.error(err);
    } finally {
        if (poolConnection) {
            await poolConnection.close();
        }
        process.exit(0);
    }
}

forceSeedCustody();
