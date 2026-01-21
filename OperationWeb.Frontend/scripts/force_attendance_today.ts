
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

async function forceAttendanceToday() {
    let pool;
    try {
        pool = await sql.connect(config);

        // 1. Determine "Today" (Local Date)
        const todayDate = new Date();
        const yyyy = todayDate.getFullYear();
        const mm = String(todayDate.getMonth() + 1).padStart(2, '0');
        const dd = String(todayDate.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`; // 2025-12-18

        console.log(`📅 Forcing Attendance for Date: ${todayStr}`);

        // 2. Get Active Employees
        const employees = await pool.query("SELECT id, nombre, dni FROM COLABORADORES WHERE active = 1");
        console.log(`👥 Found ${employees.recordset.length} active employees.`);

        let added = 0;
        let updated = 0;

        for (const emp of employees.recordset) {
            // Check if exists
            const check = await pool.query(`
                SELECT id_registro FROM ASISTENCIA_DIARIA 
                WHERE id_colaborador = ${emp.id} 
                AND fecha_asistencia = '${todayStr}'
            `);

            if (check.recordset.length > 0) {
                // Update existing to ensure it's 'presente'
                await pool.query(`
                    UPDATE ASISTENCIA_DIARIA 
                    SET estado_final = 'presente', hora_checkin = GETDATE()
                    WHERE id_colaborador = ${emp.id} AND fecha_asistencia = '${todayStr}'
                `);
                updated++;
            } else {
                // Insert new
                const idRegistro = uuidv4();
                await pool.request()
                    .input('id', sql.VarChar, idRegistro)
                    .input('colabId', sql.Int, emp.id)
                    .input('dni', sql.VarChar, emp.dni || '00000000')
                    .input('date', sql.Date, todayStr)
                    .input('status', sql.VarChar, 'presente')
                    .query(`
                        INSERT INTO ASISTENCIA_DIARIA (
                            id_registro, id_colaborador, dni_colaborador, 
                            fecha_asistencia, hora_checkin, estado_final, 
                            lat_checkin, long_checkin, check_salud_apto
                        ) VALUES (
                            @id, @colabId, @dni, 
                            @date, GETDATE(), @status, 
                            -12.0000, -77.0000, 1
                        )
                    `);
                added++;
            }
        }

        console.log(`✅ Completed.`);
        console.log(`   Added:   ${added}`);
        console.log(`   Updated: ${updated}`);
        console.log(`👉 Workers should now appear in Planning View for ${todayStr}`);

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        if (pool) await pool.close();
    }
}

forceAttendanceToday();
