
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

async function fixDuplicatePersonnel() {
    let pool;
    try {
        pool = await sql.connect(config);

        console.log("🔧 Fixing Duplicate Personnel Assignments...");
        const todayStr = new Date().toISOString().split('T')[0];

        // 1. Get List of Available Personnel (Active + NOT Assigned Today)
        const availableRes = await pool.query(`
            SELECT id, nombre, rol
            FROM COLABORADORES c
            WHERE c.active = 1
            AND c.id NOT IN (
                SELECT id_lider FROM CUADRILLA_DIARIA WHERE fecha_operacion = '${todayStr}' AND id_lider IS NOT NULL
                UNION
                SELECT id_auxiliar FROM CUADRILLA_DIARIA WHERE fecha_operacion = '${todayStr}' AND id_auxiliar IS NOT NULL
            )
        `);

        let available = availableRes.recordset;
        console.log(`Found ${available.length} available personnel.`);

        if (available.length === 0) {
            console.error("❌ Not enough available personnel to fix duplicates!");
            return;
        }

        // 2. Fix Leaders (Keep C-101 for ID 1, Move C-103 and C-104)
        // Crews to fix: '391b5b12-7cd5-4fb7-a1a8-56c2820973fb' (C-103), '7f9922e4-bbd7-4efd-9ac0-632d4399922c' (C-104)
        const leaderCrews = [
            '391b5b12-7cd5-4fb7-a1a8-56c2820973fb',
            '7f9922e4-bbd7-4efd-9ac0-632d4399922c'
        ];

        for (const crewId of leaderCrews) {
            const newLeader = available.pop();
            if (newLeader) {
                console.log(`Assigning Leader ${newLeader.nombre} (${newLeader.id}) to crew ${crewId}...`);
                await pool.query(`UPDATE CUADRILLA_DIARIA SET id_lider = ${newLeader.id} WHERE id_cuadrilla = '${crewId}'`);
            } else {
                console.warn("⚠️ No more personnel available for Leader fix.");
            }
        }

        // 3. Fix Assistants (Keep C-102 for ID 14, Move C-105)
        // Crew to fix: '08057d45-4ab0-4775-8779-14efc9f7e367' (C-105)
        const assistantCrews = ['08057d45-4ab0-4775-8779-14efc9f7e367'];

        for (const crewId of assistantCrews) {
            const newAssistant = available.pop();
            if (newAssistant) {
                console.log(`Assigning Assistant ${newAssistant.nombre} (${newAssistant.id}) to crew ${crewId}...`);
                await pool.query(`UPDATE CUADRILLA_DIARIA SET id_auxiliar = ${newAssistant.id} WHERE id_cuadrilla = '${crewId}'`);
            } else {
                console.warn("⚠️ No more personnel available for Assistant fix.");
            }
        }

        console.log("✅ Fixed Personnel Duplicates.");

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        if (pool) await pool.close();
    }
}

fixDuplicatePersonnel();
