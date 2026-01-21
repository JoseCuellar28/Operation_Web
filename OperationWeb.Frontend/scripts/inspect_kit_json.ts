
import { getConnection } from '../src/connections/sql';

async function inspect() {
    console.log('🔍 Inspecting Kit Data...');
    try {
        const pool = await getConnection();

        // 1. Get C-104 info
        const crewRes = await pool.request().query(`
            SELECT c.codigo, c.id_kit_materiales, k.nombre_kit, k.composicion_kit
            FROM CUADRILLA_DIARIA c
            LEFT JOIN CATALOGO_KITS k ON c.id_kit_materiales = k.id_kit
            WHERE c.codigo = 'C-104'
        `);

        const row = crewRes.recordset[0];
        if (!row) {
            console.log('❌ C-104 Not Found');
            return;
        }

        console.log(`\n📋 Crew: ${row.codigo}`);
        console.log(`📦 Kit: ${row.nombre_kit} (ID: ${row.id_kit_materiales})`);
        console.log(`📄 RAW JSON:\n${row.composicion_kit}`);

        // Try parsing
        try {
            const parsed = JSON.parse(row.composicion_kit);
            console.log(`\n✅ JSON Parsed OK. Items: ${parsed.length}`);
            if (parsed.length > 0) {
                console.log('Sample Item:', parsed[0]);
                // Check custodian types
                const custTypes = [...new Set(parsed.map((i: any) => i.tipo_custodio))];
                console.log('🔑 Custodian Types found:', custTypes);
            }
        } catch (e) {
            console.log('❌ JSON Parse Error:', e);
        }

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
inspect();
