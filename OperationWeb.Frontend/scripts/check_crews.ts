import { getConnection } from '../src/connections/sql';
import sql from 'mssql';

async function checkCrews() {
    console.log('Connecting to database to check Crews...');
    try {
        const pool = await getConnection();

        // 1. Check Server Date
        const timeResult = await pool.request().query('SELECT GETDATE() as serverTime, SYSDATETIMEOFFSET() as serverTimeOffset');
        console.log('--- SQL Server Time ---');
        console.log(timeResult.recordset[0]);

        // 2. Check Crews for Today and Tomorrow (Local & UTC)
        console.log('\n--- Recent Crews (Last 20) ---');
        const crewsResult = await pool.request().query(`
            SELECT TOP 20 
                id_cuadrilla, 
                codigo, 
                fecha_operacion, 
                estado_planificacion,
                id_zona
            FROM CUADRILLA_DIARIA 
            ORDER BY fecha_operacion DESC, id_cuadrilla DESC
        `);
        console.table(crewsResult.recordset);

        // 3. Count by Status/Date
        console.log('\n--- Summary by Date/Status ---');
        const summary = await pool.request().query(`
            SELECT 
                CAST(fecha_operacion AS DATE) as fecha, 
                estado_planificacion, 
                COUNT(*) as count 
            FROM CUADRILLA_DIARIA 
            GROUP BY CAST(fecha_operacion AS DATE), estado_planificacion
            ORDER BY fecha DESC
        `);
        console.table(summary.recordset);

        await pool.close();

    } catch (err) {
        console.error('Error checking crews:', err);
    }
}

checkCrews();
