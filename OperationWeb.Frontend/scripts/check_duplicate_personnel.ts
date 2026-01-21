
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

async function checkDuplicatePersonnel() {
    let pool;
    try {
        pool = await sql.connect(config);

        console.log("🔍 Checking for Duplicate Personnel Assignments for TODAY...");

        // Local Date
        const todayDate = new Date();
        const yyyy = todayDate.getFullYear();
        const mm = String(todayDate.getMonth() + 1).padStart(2, '0');
        const dd = String(todayDate.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;

        // Check Leaders
        console.log("\n--- LEADERS ---");
        const leaders = await pool.query(`
            SELECT id_lider, COUNT(*) as usage_count
            FROM CUADRILLA_DIARIA 
            WHERE fecha_operacion = '${todayStr}' AND id_lider IS NOT NULL
            GROUP BY id_lider
            HAVING COUNT(*) > 1
        `);

        if (leaders.recordset.length > 0) {
            console.log("⚠️ DUPLICATE LEADERS FOUND:");
            console.table(leaders.recordset);
            for (const row of leaders.recordset) {
                const id = row.id_lider;
                const crews = await pool.query(`
                    SELECT cd.id_cuadrilla, cd.codigo, c.nombre
                    FROM CUADRILLA_DIARIA cd
                    JOIN COLABORADORES c ON cd.id_lider = c.id
                    WHERE cd.fecha_operacion = '${todayStr}' AND cd.id_lider = ${id}
                `);
                console.table(crews.recordset);
            }
        } else {
            console.log("✅ No duplicate leaders.");
        }

        // Check Assistants
        console.log("\n--- ASSISTANTS ---");
        const assistants = await pool.query(`
            SELECT id_auxiliar, COUNT(*) as usage_count
            FROM CUADRILLA_DIARIA 
            WHERE fecha_operacion = '${todayStr}' AND id_auxiliar IS NOT NULL
            GROUP BY id_auxiliar
            HAVING COUNT(*) > 1
        `);

        if (assistants.recordset.length > 0) {
            console.log("⚠️ DUPLICATE ASSISTANTS FOUND:");
            console.table(assistants.recordset);
            for (const row of assistants.recordset) {
                const id = row.id_auxiliar;
                const crews = await pool.query(`
                    SELECT cd.id_cuadrilla, cd.codigo, c.nombre
                    FROM CUADRILLA_DIARIA cd
                    JOIN COLABORADORES c ON cd.id_auxiliar = c.id
                    WHERE cd.fecha_operacion = '${todayStr}' AND cd.id_auxiliar = ${id}
                `);
                console.table(crews.recordset);
            }
        } else {
            console.log("✅ No duplicate assistants.");
        }

        // Check Cross-Role (Leader is also Assistant somewhere else)
        console.log("\n--- CROSS ROLE (Leader <-> Assistant) ---");
        const cross = await pool.query(`
            SELECT l.id_lider as person_id, count(*) as count
            FROM CUADRILLA_DIARIA l
            JOIN CUADRILLA_DIARIA a ON l.id_lider = a.id_auxiliar
            WHERE l.fecha_operacion = '${todayStr}' AND a.fecha_operacion = '${todayStr}'
            GROUP BY l.id_lider
        `);

        if (cross.recordset.length > 0) {
            console.log("⚠️ CROSS-ROLE DUPLICATES FOUND (Same person is Leader and Assistant):");
            console.table(cross.recordset);
        } else {
            console.log("✅ No cross-role duplicates.");
        }


    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        if (pool) await pool.close();
    }
}

checkDuplicatePersonnel();
