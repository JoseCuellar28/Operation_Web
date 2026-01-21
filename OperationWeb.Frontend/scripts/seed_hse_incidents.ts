
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

const INCIDENT_TYPES = [
    { type: 'LEVE', desc: 'Uso incorrecto de EPP (Casco desajustado)' },
    { type: 'LEVE', desc: 'Señalización deficiente en zona de trabajo' },
    { type: 'LEVE', desc: 'Vehículo mal estacionado (obstruye paso)' },
    { type: 'GRAVE', desc: 'Trabajo en altura sin línea de vida ancada' },
    { type: 'GRAVE', desc: 'Conductor excediendo velocidad en zona escolar' },
    { type: 'MORTAL', desc: 'SIMULACRO: Caída de poste' }
];

async function seedHSEIncidents() {
    let pool;
    try {
        pool = await sql.connect(config);

        console.log("🛡️ Seeding HSE Incidents...");

        const todayStr = new Date().toISOString().split('T')[0];

        // 1. Clean old incidents for today
        await pool.query(`DELETE FROM INCIDENTES WHERE CAST(timestamp_inicio AS DATE) = '${todayStr}'`);

        // 2. Get Active Crews
        const crews = await pool.query(`
            SELECT id_cuadrilla, placa_vehiculo 
            FROM CUADRILLA_DIARIA 
            WHERE fecha_operacion = '${todayStr}' 
            AND placa_vehiculo IS NOT NULL
        `);

        if (crews.recordset.length === 0) {
            console.log("⚠️ No active crews found.");
            return;
        }

        console.log(`📋 Generating 15 Incident Reports across ${crews.recordset.length} Crews...`);

        // Generate exactly 15 reports distributed among crews
        // 5 Crews -> 3 reports each
        let count = 0;
        for (const crew of crews.recordset) {
            for (let i = 0; i < 3; i++) {
                const isSerious = i === 2; // Every 3rd report is serious
                const incident = INCIDENT_TYPES[Math.floor(Math.random() * INCIDENT_TYPES.length)];

                // Override to ensure mix
                const severity = isSerious ? 'GRAVE' : 'LEVE';
                const desc = isSerious ? 'Bloqueo Preventivo: Falta de EPP Crítico' : incident.desc;

                await pool.request()
                    .input('id_cuadrilla', sql.NVarChar, crew.placa_vehiculo) // Using Plate for readability
                    .input('gravedad', sql.NVarChar, severity)
                    .input('descripcion', sql.NVarChar, `${desc} [${crew.placa_vehiculo}]`)
                    .input('estado', sql.NVarChar, 'ABIERTO')
                    .query(`
                        INSERT INTO INCIDENTES (
                            id_cuadrilla, gravedad, descripcion, estado, timestamp_inicio
                        ) VALUES (
                            @id_cuadrilla, @gravedad, @descripcion, @estado, DATEADD(minute, -${count * 20}, GETDATE())
                        )
                    `);
                count++;
            }
        }

        console.log(`✅ Seed Complete. Created ${count} Incident Reports.`);

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        if (pool) await pool.close();
    }
}

seedHSEIncidents();
