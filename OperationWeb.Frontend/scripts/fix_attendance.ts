
import sql from 'mssql';
import { v4 as uuidv4 } from 'uuid';
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

async function fixAttendance() {
    let pool;
    try {
        pool = await sql.connect(config);

        console.log("🛠️ Fixing Attendance for TODAY (Using Correct Schema)...");

        // 1. Get all active employees
        const employees = await pool.query("SELECT id, nombre, dni FROM COLABORADORES WHERE active = 1");

        if (employees.recordset.length === 0) {
            console.log("⚠️ No active employees found.");
            return;
        }

        console.log(`Found ${employees.recordset.length} active employees.`);

        // 2. Insert Attendance for TODAY if not exists
        let addedCount = 0;
        const todayStr = new Date().toISOString().split('T')[0];

        for (const emp of employees.recordset) {
            try {
                // Check if already present
                const check = await pool.query(`
                    SELECT id_registro FROM ASISTENCIA_DIARIA 
                    WHERE id_colaborador = '${emp.id}' 
                    AND fecha_asistencia = '${todayStr}'
                `);

                if (check.recordset.length === 0) {
                    const idRegistro = uuidv4(); // Generate valid UUID

                    await pool.request()
                        .input('id', sql.VarChar, idRegistro)
                        .input('colabId', sql.Int, emp.id)
                        .input('dni', sql.VarChar, emp.dni || '00000000')
                        .input('date', sql.Date, todayStr)
                        .input('time', sql.DateTime, new Date())
                        .input('status', sql.VarChar, 'presente') // estado_final
                        .query(`
                            INSERT INTO ASISTENCIA_DIARIA (
                                id_registro, 
                                id_colaborador, 
                                dni_colaborador,
                                fecha_asistencia, 
                                hora_checkin, 
                                estado_final,
                                lat_checkin,
                                long_checkin,
                                check_salud_apto
                            ) VALUES (
                                @id, 
                                @colabId, 
                                @dni,
                                @date, 
                                @time, 
                                @status,
                                -12.0464,
                                -77.0428,
                                1
                            )
                        `);
                    addedCount++;
                }
            } catch (innerErr) {
                console.error(`Failed to add attendance for ${emp.nombre}`, innerErr);
            }
        }

        console.log(`✅ Attendance fixed. Added ${addedCount} records for today.`);
        console.log("👉 Please refresh the Planning View.");

    } catch (err) {
        console.error(err);
    } finally {
        if (pool) await pool.close();
    }
}

fixAttendance();
