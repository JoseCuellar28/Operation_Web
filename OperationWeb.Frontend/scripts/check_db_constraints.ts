
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

async function checkConstraints() {
    let pool;
    try {
        pool = await sql.connect(config);

        // Get the check constraint definition
        // We know the name partially: CK__MOVIMIENT__tipo__...
        const res = await pool.query(`
            SELECT pg.definition 
            FROM sys.check_constraints cc
            JOIN sys.default_constraints dc ON cc.parent_column_id = dc.parent_column_id 
            RIGHT JOIN sys.check_constraints pg ON pg.parent_object_id = OBJECT_ID('MOVIMIENTOS_ALMACEN')
            WHERE pg.name LIKE 'CK__MOVIMIENT__tipo%'
        `);

        if (res.recordset.length > 0) {
            console.log('Constraint Definition:', res.recordset[0].definition);
        } else {
            // Fallback: try to see all check constraints for the table
            const res2 = await pool.query(`
                SELECT name, definition 
                FROM sys.check_constraints 
                WHERE parent_object_id = OBJECT_ID('MOVIMIENTOS_ALMACEN')
             `);
            console.log('All Constraints:', res2.recordset);
        }

    } catch (err) {
        console.error(err);
    } finally {
        if (pool) await pool.close();
    }
}

checkConstraints();
