
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

async function inspectWarehouse() {
    let pool;
    try {
        pool = await sql.connect(config);
        console.log('Connected.');

        const res = await pool.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'STOCK_ALMACEN'
        `);

        console.log('Columns in STOCK_ALMACEN:', res.recordset.map(r => r.COLUMN_NAME));

    } catch (err) {
        console.error(err);
    } finally {
        if (pool) await pool.close();
        process.exit(0);
    }
}

inspectWarehouse();
