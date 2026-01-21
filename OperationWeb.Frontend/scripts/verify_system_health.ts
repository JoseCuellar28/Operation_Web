import { getConnection } from '../src/connections/sql';
import sql from 'mssql';

async function verifySystemHealth() {
    console.log('🏥 Starting System Health Check...');
    let pool;
    try {
        pool = await getConnection();

        // 1. Check Tables Existence & Counts
        const tables = [
            'ORDENES_TRABAJO', 'CUADRILLA_DIARIA', 'COLABORADORES', // Logistics
            'LOTE_VALORIZACION', // Finance
            'VEHICULOS', 'REGISTRO_VEHICULAR', 'VEHICLE_TRACKING_LOGS', // Fleet
            'INCIDENTES', 'AUDITORIA_SEGURIDAD' // HSE
        ];

        console.log('\n📊 Database Integrity Check:');
        for (const table of tables) {
            try {
                const countResult = await pool.request().query(`SELECT COUNT(*) as c FROM ${table}`);
                const count = countResult.recordset[0].c;
                console.log(`   ✅ ${table}: ${count} records (OK)`);
            } catch (err) {
                console.error(`   ❌ ${table}: MISSING or Error`);
            }
        }

        // 2. Check Critical Columns (Schema Validations)
        console.log('\n🔍 Critical Schema Validation:');

        // HSE: timestamp_inicio in INCIDENTES
        try {
            await pool.request().query("SELECT TOP 1 timestamp_inicio FROM INCIDENTES");
            console.log('   ✅ INCIDENTES.timestamp_inicio exists');
        } catch (e) { console.error('   ❌ INCIDENTES.timestamp_inicio MISSING'); }

        // HSE: estado_operativo in COLABORADORES
        try {
            await pool.request().query("SELECT TOP 1 estado_operativo FROM COLABORADORES");
            console.log('   ✅ COLABORADORES.estado_operativo exists');
        } catch (e) { console.error('   ❌ COLABORADORES.estado_operativo MISSING'); }

        // Logistics: version in CUADRILLA_DIARIA
        try {
            await pool.request().query("SELECT TOP 1 version FROM CUADRILLA_DIARIA");
            console.log('   ✅ CUADRILLA_DIARIA.version exists');
        } catch (e) { console.error('   ❌ CUADRILLA_DIARIA.version MISSING'); }


        console.log('\n🚀 System Verification Complete.');
        await pool.close();

    } catch (err) {
        console.error('System Check Failed:', err);
    }
}

verifySystemHealth();
