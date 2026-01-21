import { getConnection } from '../src/connections/sql';
import sql from 'mssql';

async function checkOTs() {
    console.log('Checking ORDENES_TRABAJO...');
    try {
        const pool = await getConnection();

        // 1. Check specific Mock OT
        console.log('\n--- Mock OT AAAAA... ---');
        const mockRes = await pool.request().query("SELECT id_ot, codigo_suministro, estado, hora_inicio_real, fecha_programada FROM ORDENES_TRABAJO WHERE id_ot = 'AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA'");
        console.table(mockRes.recordset);

        // 2. Check Execution Query Logic (Simulation)
        console.log('\n--- Test Execution Query Logic ---');
        const testRes = await pool.request().query(`
            SELECT 
                ot.id_ot, ot.codigo_suministro, ot.estado,
                -- Debug Checks
                CAST(GETDATE() AS DATE) as server_today,
                CAST(ot.fecha_programada AS DATE) as ot_date,
                (CASE WHEN ot.estado = 'EJECUCION' THEN 1 ELSE 0 END) as is_exec,
                (CASE WHEN CAST(ot.fecha_programada AS DATE) = CAST(GETDATE() AS DATE) THEN 1 ELSE 0 END) as is_today
            FROM ORDENES_TRABAJO ot
            WHERE ot.id_ot = 'AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA'
        `);
        console.table(testRes.recordset);

        await pool.close();
    } catch (err) {
        console.error(err);
    }
}

checkOTs();
