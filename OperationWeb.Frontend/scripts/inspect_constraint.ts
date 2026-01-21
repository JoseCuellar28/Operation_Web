
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

async function inspectConstraint() {
    let pool;
    try {
        pool = await sql.connect(config);

        console.log("🔍 Inspecting CHECK Constraints for CONSUMO_MATERIALES...");

        const res = await pool.query(`
            SELECT definition 
            FROM sys.check_constraints 
            WHERE parent_object_id = OBJECT_ID('CONSUMO_MATERIALES')
        `);

        res.recordset.forEach(r => console.log(r.definition));

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        if (pool) await pool.close();
    }
}

inspectConstraint();
