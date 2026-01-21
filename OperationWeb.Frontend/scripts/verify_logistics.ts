
import { getConnection } from '../src/connections/sql';

async function runVerification() {
    console.log('🔍 Running 20 Verification Tests for Logistics Module...\n');
    let pool;
    let errors = 0;

    try {
        pool = await getConnection();

        const checks = [
            // 1-5: Material Catalog Types
            { name: 'Materials exist', query: "SELECT COUNT(*) as c FROM CATALOGO_MATERIALES", check: (r: any) => r[0].c > 10 },
            { name: 'No invalid types', query: "SELECT COUNT(*) as c FROM CATALOGO_MATERIALES WHERE tipo NOT IN ('ACTIVO', 'CONSUMIBLE')", check: (r: any) => r[0].c === 0 },
            { name: 'Tools identified', query: "SELECT COUNT(*) as c FROM CATALOGO_MATERIALES WHERE tipo='ACTIVO'", check: (r: any) => r[0].c > 0 },
            { name: 'Consumables identified', query: "SELECT COUNT(*) as c FROM CATALOGO_MATERIALES WHERE tipo='CONSUMIBLE'", check: (r: any) => r[0].c > 0 },
            { name: 'Prices set', query: "SELECT COUNT(*) as c FROM CATALOGO_MATERIALES WHERE costo_unitario IS NULL", check: (r: any) => r[0].c === 0 },

            // 6-10: Kits Integrity
            { name: 'Kits created', query: "SELECT COUNT(*) as c FROM CATALOGO_KITS", check: (r: any) => r[0].c >= 3 },
            { name: 'Kits have JSON content', query: "SELECT COUNT(*) as c FROM CATALOGO_KITS WHERE composicion_kit IS NULL OR composicion_kit = '[]'", check: (r: any) => r[0].c === 0 },
            { name: 'HFC Kit exists', query: "SELECT COUNT(*) as c FROM CATALOGO_KITS WHERE nombre_kit LIKE '%HFC%'", check: (r: any) => r[0].c > 0 },
            { name: 'FTTH Kit exists', query: "SELECT COUNT(*) as c FROM CATALOGO_KITS WHERE nombre_kit LIKE '%FTTH%'", check: (r: any) => r[0].c > 0 },
            { name: 'Mantenimiento Kit exists', query: "SELECT COUNT(*) as c FROM CATALOGO_KITS WHERE nombre_kit LIKE '%MANTENIMIENTO%'", check: (r: any) => r[0].c > 0 },

            // 11-15: Crew Assignment
            { name: 'Today Crews exist', query: "SELECT COUNT(*) as c FROM CUADRILLA_DIARIA WHERE fecha_operacion = CAST(GETDATE() AS DATE)", check: (r: any) => r[0].c > 0 },
            { name: 'Crews have Kits assigned', query: "SELECT COUNT(*) as c FROM CUADRILLA_DIARIA WHERE fecha_operacion = CAST(GETDATE() AS DATE) AND id_kit_materiales IS NULL", check: (r: any) => r[0].c === 0 },
            { name: 'C-104 has Kit', query: "SELECT COUNT(*) as c FROM CUADRILLA_DIARIA WHERE codigo='C-104' AND id_kit_materiales IS NOT NULL", check: (r: any) => r[0].c === 1 },
            { name: 'Leader assigned', query: "SELECT COUNT(*) as c FROM CUADRILLA_DIARIA WHERE id_lider IS NOT NULL", check: (r: any) => r[0].c > 0 },
            { name: 'Vehicle assigned', query: "SELECT COUNT(*) as c FROM CUADRILLA_DIARIA WHERE placa_vehiculo IS NOT NULL", check: (r: any) => r[0].c > 0 },

            // 16-20: Stock & Logistics
            { name: 'Stock Table exists', query: "SELECT COUNT(*) as c FROM sys.tables WHERE name='STOCK_ALMACEN'", check: (r: any) => r[0].c === 1 },
            { name: 'Custody Table exists', query: "SELECT COUNT(*) as c FROM sys.tables WHERE name='STOCK_CUSTODIA'", check: (r: any) => r[0].c === 1 },
            { name: 'Movements Table exists', query: "SELECT COUNT(*) as c FROM sys.tables WHERE name='MOVIMIENTOS_ALMACEN'", check: (r: any) => r[0].c === 1 },
            {
                name: 'Pending Dispatch Query potential', query: `
                SELECT COUNT(*) as c 
                FROM CUADRILLA_DIARIA c 
                WHERE c.fecha_operacion = CAST(GETDATE() AS DATE) 
                AND NOT EXISTS (SELECT 1 FROM MOVIMIENTOS_ALMACEN m WHERE m.documento_ref = 'DESPACHO-' + CAST(c.id_cuadrilla AS VARCHAR))
            `, check: (r: any) => r[0].c >= 0
            }, // Just valid query check
            { name: 'Critical Material (Modem) exists', query: "SELECT COUNT(*) as c FROM CATALOGO_MATERIALES WHERE nombre LIKE '%MODEM%'", check: (r: any) => r[0].c > 0 },
        ];

        for (const [i, test] of checks.entries()) {
            process.stdout.write(`Test ${i + 1}/20: ${test.name}... `);
            try {
                const res = await pool.request().query(test.query);
                if (test.check(res.recordset)) {
                    console.log('✅ PASS');
                } else {
                    console.log('❌ FAIL');
                    console.log('   Result:', JSON.stringify(res.recordset));
                    errors++;
                }
            } catch (e: any) {
                console.log('❌ ERROR');
                console.log('   Msg:', e.message);
                errors++;
            }
        }

    } catch (err) {
        console.error('Fatal Error:', err);
    } finally {
        if (errors === 0) console.log('\n✨ ALL 20 TESTS PASSED SUCCESSFULLY ✨');
        else console.log(`\n⚠️ ${errors} TESTS FAILED`);
        process.exit(errors > 0 ? 1 : 0);
    }
}

runVerification();
