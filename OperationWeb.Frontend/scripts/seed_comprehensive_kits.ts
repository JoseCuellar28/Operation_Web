
import sql from 'mssql';
import { getConnection } from '../src/connections/sql';
import { v4 as uuidv4 } from 'uuid';

const MATERIALS = [
    { name: 'CABLE COAXIAL RG6', unit: 'METRO', type: 'CONSUMIBLE', cost: 1.20 },
    { name: 'CABLE UTP CAT6 EXTERIORES', unit: 'METRO', type: 'CONSUMIBLE', cost: 1.80 },
    { name: 'CABLE FIBRA OPTICA DROP 1H', unit: 'METRO', type: 'CONSUMIBLE', cost: 0.90 },
    { name: 'CONECTOR RG6 COMPRESION', unit: 'UNIDAD', type: 'CONSUMIBLE', cost: 0.50 },
    { name: 'CONECTOR RJ45 CAT6', unit: 'UNIDAD', type: 'CONSUMIBLE', cost: 0.80 },
    { name: 'CONECTOR MECANICO SC/APC', unit: 'UNIDAD', type: 'CONSUMIBLE', cost: 12.00 },
    { name: 'SPLITTER 1X2 BALANCEADO', unit: 'UNIDAD', type: 'CONSUMIBLE', cost: 15.00 },
    { name: 'SPLITTER 1X4 DESBALANCEADO', unit: 'UNIDAD', type: 'CONSUMIBLE', cost: 22.00 },
    { name: 'MODEM HFC DOCSIS 3.1', unit: 'UNIDAD', type: 'ACTIVO', cost: 150.00 },
    { name: 'ONT FIBRA HUAWEI', unit: 'UNIDAD', type: 'ACTIVO', cost: 180.00 },
    { name: 'DECODIFICADOR HD', unit: 'UNIDAD', type: 'ACTIVO', cost: 90.00 },
    { name: 'CONTROL REMOTO UNIVERSAL', unit: 'UNIDAD', type: 'CONSUMIBLE', cost: 25.00 },
    { name: 'DIVISOR DE SENAL 2 VIAS', unit: 'UNIDAD', type: 'CONSUMIBLE', cost: 3.50 },
    { name: 'FILTRO PASA ALTOS', unit: 'UNIDAD', type: 'CONSUMIBLE', cost: 8.00 },
    { name: 'GRAPA CIRCULAR 6MM', unit: 'PAQUETE', type: 'CONSUMIBLE', cost: 5.00 },
    { name: 'PRECINTOS NEGROS 20CM', unit: 'PAQUETE', type: 'CONSUMIBLE', cost: 4.00 },
    { name: 'CINTA AISLANTE 3M', unit: 'UNIDAD', type: 'CONSUMIBLE', cost: 6.00 },
    { name: 'CINTA VULCANIZANTE', unit: 'UNIDAD', type: 'CONSUMIBLE', cost: 12.00 },
    { name: 'ETIQUETAS DE IDENTIFICACION', unit: 'UNIDAD', type: 'CONSUMIBLE', cost: 0.20 },
    { name: 'PITONES CON TARUGO', unit: 'PAQUETE', type: 'CONSUMIBLE', cost: 3.00 },

    // Tools / EPPs
    { name: 'TALADRO PERCUTOR BOSCH', unit: 'UNIDAD', type: 'ACTIVO', cost: 450.00, custodian: 'TECNICO' },
    { name: 'CRIMPEADORA RG6', unit: 'UNIDAD', type: 'ACTIVO', cost: 80.00, custodian: 'TECNICO' },
    { name: 'PONCHADORA DE IMPACTO', unit: 'UNIDAD', type: 'ACTIVO', cost: 60.00, custodian: 'TECNICO' },
    { name: 'MEDIDOR DE POTENCIA OPTICA', unit: 'UNIDAD', type: 'ACTIVO', cost: 300.00, custodian: 'TECNICO' },
    { name: 'LOCALIZADOR VISUAL DE FALLAS ( VFL )', unit: 'UNIDAD', type: 'ACTIVO', cost: 120.00, custodian: 'TECNICO' },
    { name: 'ESCRITORIO PORTATIL', unit: 'UNIDAD', type: 'ACTIVO', cost: 50.00, custodian: 'TECNICO' },
    { name: 'CASCO DE SEGURIDAD', unit: 'UNIDAD', type: 'ACTIVO', cost: 40.00, custodian: 'TECNICO' },
    { name: 'ARNES DE SEGURIDAD', unit: 'UNIDAD', type: 'ACTIVO', cost: 150.00, custodian: 'TECNICO' },
    { name: 'ESCALERA TELESCOPICA 24 PASOS', unit: 'UNIDAD', type: 'ACTIVO', cost: 800.00, custodian: 'VEHICULO' },
    { name: 'CONOS DE SEGURIDAD', unit: 'UNIDAD', type: 'CONSUMIBLE', cost: 30.00, custodian: 'VEHICULO' }
];

async function seedComprehensive() {
    console.log('🚀 Starting Comprehensive Seed...');
    let pool;
    try {
        pool = await getConnection();

        // 1. Upsert Materials and get IDs
        console.log('📦 Upserting Materials...');
        const materialMap = new Map(); // Name -> ID

        for (const mat of MATERIALS) {
            // Check if exists to keep ID stable or insert new
            let res = await pool.request().query(`SELECT id_material FROM CATALOGO_MATERIALES WHERE nombre = '${mat.name}'`);
            let id = res.recordset[0]?.id_material;

            if (!id) {
                id = uuidv4();
                await pool.request().query(`
                    INSERT INTO CATALOGO_MATERIALES (id_material, nombre, tipo, unidad_medida, costo_unitario, id_gesproyec)
                    VALUES ('${id}', '${mat.name}', '${mat.type}', '${mat.unit}', ${mat.cost}, 'MOCK-${Math.floor(Math.random() * 1000)}')
                `);
            }
            materialMap.set(mat.name, id);
        }

        // 2. Define Kits
        const KITS = [
            {
                name: 'KIT-HFC-BASICO',
                items: [
                    'CABLE COAXIAL RG6', 'CONECTOR RG6 COMPRESION', 'SPLITTER 1X2 BALANCEADO',
                    'DIVISOR DE SENAL 2 VIAS', 'MODEM HFC DOCSIS 3.1', 'CINTA AISLANTE 3M',
                    'TALADRO PERCUTOR BOSCH', 'CRIMPEADORA RG6', 'ESCALERA TELESCOPICA 24 PASOS', 'CONOS DE SEGURIDAD',
                    'Filtro Pasa Altos', 'Grapa Circular 6mm', 'Precintos Negros 20cm'
                ]
            },
            {
                name: 'KIT-FTTH-PREMIUM',
                items: [
                    'CABLE FIBRA OPTICA DROP 1H', 'CONECTOR MECANICO SC/APC', 'ONT FIBRA HUAWEI',
                    'DECODIFICADOR HD', 'CONTROL REMOTO UNIVERSAL', 'CINTA VULCANIZANTE',
                    'MEDIDOR DE POTENCIA OPTICA', 'LOCALIZADOR VISUAL DE FALLAS ( VFL )',
                    'ESCALERA TELESCOPICA 24 PASOS', 'CASCO DE SEGURIDAD', 'ARNES DE SEGURIDAD'
                ]
            },
            {
                name: 'KIT-MANTENIMIENTO-GRAL',
                items: [
                    'CABLE UTP CAT6 EXTERIORES', 'CONECTOR RJ45 CAT6', 'CINTA AISLANTE 3M',
                    'PONCHADORA DE IMPACTO', 'ESCRITORIO PORTATIL', 'CONOS DE SEGURIDAD',
                    'Etiquetas de identificacion', 'Pitones con tarugo'
                ]
            }
        ];

        // 3. Create Kits
        console.log('🧰 Creating Kits...');
        const kitIds = [];

        for (const kitDef of KITS) {
            const composicion = [];

            // Randomize quantities slightly
            for (const itemName of kitDef.items) {
                // Find material (fuzzy match case insensitive)
                const matKey = [...materialMap.keys()].find(k => k.toUpperCase() === itemName.toUpperCase());
                if (!matKey) continue;

                const matInfo = MATERIALS.find(m => m.name === matKey);
                if (!matInfo) {
                    console.warn(`Material not found in MATERIALS array for key: ${matKey}`);
                    continue;
                }
                const isTool = matInfo.type === 'ACTIVO' || matInfo.type === 'EPP';

                composicion.push({
                    id_material: materialMap.get(matKey),
                    nombre: matKey,
                    cantidad: isTool ? (matKey.includes('CONOS') ? 2 : 1) : Math.floor(Math.random() * 50) + 5,
                    tipo_custodio: matInfo.custodian || (isTool ? 'TECNICO' : 'VEHICULO')
                });
            }

            const json = JSON.stringify(composicion);

            // Upsert Kit
            await pool.request()
                .input('json', sql.NVarChar, json)
                .query(`
                    IF EXISTS (SELECT 1 FROM CATALOGO_KITS WHERE nombre_kit = '${kitDef.name}')
                        UPDATE CATALOGO_KITS SET composicion_kit = @json WHERE nombre_kit = '${kitDef.name}';
                    ELSE
                        INSERT INTO CATALOGO_KITS (nombre_kit, tipo_servicio, composicion_kit)
                        VALUES ('${kitDef.name}', 'GENERAL', @json);
                `);

            const res = await pool.request().query(`SELECT id_kit FROM CATALOGO_KITS WHERE nombre_kit = '${kitDef.name}'`);
            kitIds.push(res.recordset[0].id_kit);
        }

        // 4. Update Daily Crews
        console.log('👷 Assigning Kits to Today Crews...');
        // Get all crews for today
        const crews = await pool.request().query(`SELECT id_cuadrilla FROM CUADRILLA_DIARIA WHERE fecha_operacion = CAST(GETDATE() AS DATE)`);

        for (const crew of crews.recordset) {
            // Assign random kit
            const randomKitId = kitIds[Math.floor(Math.random() * kitIds.length)];
            await pool.request().query(`
                UPDATE CUADRILLA_DIARIA 
                SET id_kit_materiales = ${randomKitId} 
                WHERE id_cuadrilla = '${crew.id_cuadrilla}'
            `);
        }

        console.log('✅ Done! 3 Full Kits created and assigned to active crews.');

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        process.exit();
    }
}

seedComprehensive();
