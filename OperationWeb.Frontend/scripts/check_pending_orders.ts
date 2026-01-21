
import { getConnection } from '../src/connections/sql';

async function checkPendingOrders() {
    console.log('Connecting to database...');
    try {
        const pool = await getConnection();
        console.log('Connected to SQL Server.');

        // Count Total
        const totalResult = await pool.request().query('SELECT COUNT(*) as count FROM ORDENES_TRABAJO');
        console.log(`Total Orders in DB: ${totalResult.recordset[0].count}`);

        // Count Valid for Map
        const validResult = await pool.request().query(`
            SELECT COUNT(*) as count 
            FROM ORDENES_TRABAJO 
            WHERE estado = 'PENDIENTE' 
            AND latitud IS NOT NULL 
            AND longitud IS NOT NULL
        `);
        console.log(`Orders visible on Map (PENDIENTE + Coords): ${validResult.recordset[0].count}`);

        // Sample
        if (validResult.recordset[0].count > 0) {
            const sample = await pool.request().query(`
                SELECT TOP 3 id_ot, codigo_suministro, latitud, longitud, estado 
                FROM ORDENES_TRABAJO 
                WHERE estado = 'PENDIENTE' 
                AND latitud IS NOT NULL 
                AND longitud IS NOT NULL
            `);
            console.log('Sample Data:', sample.recordset);
        } else {
            console.log('WARNING: No orders meet criteria. Checking why...');
            // Check if coordinates missing
            const missingCoords = await pool.request().query(`
                SELECT COUNT(*) as count FROM ORDENES_TRABAJO WHERE estado = 'PENDIENTE' AND (latitud IS NULL OR longitud IS NULL)
            `);
            console.log(`Pending Orders with MISSING Coords: ${missingCoords.recordset[0].count}`);
        }

        await pool.close();

    } catch (err) {
        console.error('Error:', err);
    }
}

checkPendingOrders();
