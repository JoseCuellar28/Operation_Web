
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

async function inspectIncidentsFK() {
    let pool;
    try {
        pool = await sql.connect(config);

        console.log("🔍 Inspecting Foreign Keys for INCIDENTES...");

        const res = await pool.query(`
            SELECT 
                fk.name AS FK_Name,
                tp.name AS Parenttable,
                cp.name AS ParentColumn,
                tr.name AS ReferencedTable,
                cr.name AS ReferencedColumn
            FROM 
                sys.foreign_keys AS fk
            INNER JOIN 
                sys.tables AS tp ON fk.parent_object_id = tp.object_id
            INNER JOIN 
                sys.tables AS tr ON fk.referenced_object_id = tr.object_id
            INNER JOIN 
                sys.foreign_key_columns AS fkc ON fkc.constraint_object_id = fk.object_id
            INNER JOIN 
                sys.columns AS cp ON fkc.parent_column_id = cp.column_id AND fkc.parent_object_id = cp.object_id
            INNER JOIN 
                sys.columns AS cr ON fkc.referenced_column_id = cr.column_id AND fkc.referenced_object_id = cr.object_id
            WHERE 
                tp.name = 'INCIDENTES';
        `);

        if (res.recordset.length === 0) {
            console.log("No Foreign Keys found.");
        } else {
            console.table(res.recordset);
        }

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        if (pool) await pool.close();
    }
}

inspectIncidentsFK();
