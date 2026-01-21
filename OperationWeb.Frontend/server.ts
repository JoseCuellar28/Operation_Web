import express from 'express';
import cors from 'cors';
import { getConnection, sql } from './src/connections/sql';
import crypto from 'crypto';

const app = express();
const port = process.env.PORT || 3000;

// Debug Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- CATALOGO MATERIALES ---
app.get('/api/v1/materiales', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT * FROM CATALOGO_MATERIALES ORDER BY nombre');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching materials' });
    }
});

app.post('/api/v1/materiales', async (req, res) => {
    try {
        const { nombre, tipo, unidad_medida, costo_unitario } = req.body;
        const pool = await getConnection();
        await pool.request()
            .input('nombre', sql.NVarChar, nombre)
            .input('tipo', sql.NVarChar, tipo)
            .input('unidad', sql.NVarChar, unidad_medida)
            .input('costo', sql.Decimal(10, 2), costo_unitario)
            .query('INSERT INTO CATALOGO_MATERIALES (nombre, tipo, unidad_medida, costo_unitario) VALUES (@nombre, @tipo, @unidad, @costo)');
        res.json({ message: 'Material created' });
    } catch (error) {
        res.status(500).json({ error: 'Error creating material' });
    }
});

app.post('/api/v1/materiales/batch', async (req, res) => {
    try {
        const materials = req.body; // Array
        const pool = await getConnection();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const request = new sql.Request(transaction);
            for (const m of materials) {
                await request.query(`
                    INSERT INTO CATALOGO_MATERIALES (nombre, tipo, unidad_medida, costo_unitario)
                    VALUES ('${m.nombre}', '${m.tipo}', '${m.unidad_medida}', ${m.costo_unitario})
                `);
            }
            await transaction.commit();
            res.json({ message: 'Batch materials created' });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error processing batch' });
    }
});

// --- VEHICULOS ---
app.get('/api/v1/vehiculos', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT * FROM VEHICULOS ORDER BY placa');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching vehicles' });
    }
});

app.post('/api/v1/vehiculos/batch', async (req, res) => {
    try {
        const vehicles = req.body;
        const pool = await getConnection();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const request = new sql.Request(transaction);
            for (const v of vehicles) {
                await request.query(`
                    IF NOT EXISTS (SELECT 1 FROM VEHICULOS WHERE placa = '${v.placa}')
                    INSERT INTO VEHICULOS (placa, marca, tipo_activo, max_volumen, estado)
                    VALUES ('${v.placa}', '${v.marca}', '${v.tipo_activo}', '${v.max_volumen}', 'OPERATIVO')
                `);
            }
            await transaction.commit();
            res.json({ message: 'Batch vehicles processed' });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (error) {
        res.status(500).json({ error: 'Error processing batch' });
    }
});


// --- KITS ---
app.get('/api/v1/kits', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT * FROM CATALOGO_KITS');
        // Parse JSONB
        const kits = result.recordset.map(k => ({
            ...k,
            composicion_kit: JSON.parse(k.composicion_kit || '[]')
        }));
        res.json(kits);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching kits' });
    }
});

app.post('/api/v1/kits', async (req, res) => {
    try {
        const { nombre_kit, tipo_servicio, composicion_kit } = req.body;
        const pool = await getConnection();
        const json = JSON.stringify(composicion_kit);

        await pool.request()
            .input('nombre', sql.NVarChar, nombre_kit)
            .input('tipo', sql.NVarChar, tipo_servicio)
            .input('comp', sql.NVarChar, json)
            .query('INSERT INTO CATALOGO_KITS (nombre_kit, tipo_servicio, composicion_kit) VALUES (@nombre, @tipo, @comp)');

        res.json({ message: 'Kit created' });
    } catch (error) {
        res.status(500).json({ error: 'Error creating kit' });
    }
});

app.put('/api/v1/kits/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_kit, tipo_servicio, composicion_kit } = req.body;
        const pool = await getConnection();
        const json = JSON.stringify(composicion_kit);

        await pool.request()
            .input('id', sql.Int, id) // Assuming id is Int based on sequence, but need to check if UUID. Let's assume Int from inspect earlier or auto-increment identity
            .input('nombre', sql.NVarChar, nombre_kit)
            .input('tipo', sql.NVarChar, tipo_servicio)
            .input('comp', sql.NVarChar, json)
            .query('UPDATE CATALOGO_KITS SET nombre_kit = @nombre, tipo_servicio = @tipo, composicion_kit = @comp WHERE id_kit = @id');

        res.json({ message: 'Kit updated' });
    } catch (error) {
        console.error('Error updating kit:', error);
        res.status(500).json({ error: 'Error updating kit' });
    }
});

app.delete('/api/v1/kits/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM CATALOGO_KITS WHERE id_kit = @id');
        res.json({ message: 'Kit deleted' });
    } catch (error) {
        console.error('Error deleting kit:', error);
        res.status(500).json({ error: 'Error deleting kit' });
    }
});

app.post('/api/v1/kits/batch', async (req, res) => {
    try {
        const kits = req.body;
        const pool = await getConnection();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const request = new sql.Request(transaction);
            for (const k of kits) {
                const json = JSON.stringify(k.composicion_kit);
                await request.query(`
                    INSERT INTO CATALOGO_KITS (nombre_kit, tipo_servicio, composicion_kit)
                    VALUES ('${k.nombre_kit}', '${k.tipo_servicio}', '${json}')
                `);
            }
            await transaction.commit();
            res.json({ message: 'Batch kits created' });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (error) {
        res.status(500).json({ error: 'Error processing batch' });
    }
});


// --- FORMATOS ---
app.get('/api/v1/formatos', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT * FROM FORMATOS_PAPELERIA');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching formats' });
    }
});

app.post('/api/v1/formatos/batch', async (req, res) => {
    try {
        const formats = req.body;
        const pool = await getConnection();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const request = new sql.Request(transaction);
            for (const f of formats) {
                const ini = f.rango_inicio || 'NULL';
                const fin = f.rango_fin || 'NULL';
                const ctrl = f.control_series ? 1 : 0;

                await request.query(`
                    INSERT INTO FORMATOS_PAPELERIA (nombre, control_series, rango_inicio, rango_fin)
                    VALUES ('${f.nombre}', ${ctrl}, ${ini}, ${fin})
                `);
            }
            await transaction.commit();
            res.json({ message: 'Batch formats created' });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (error) {
        res.status(500).json({ error: 'Error processing batch' });
    }
});

app.put('/api/v1/formatos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const f = req.body;
        const ini = f.rango_inicio || 'NULL';
        const fin = f.rango_fin || 'NULL';
        const ctrl = f.control_series ? 1 : 0;

        const pool = await getConnection();
        await pool.request().query(`
            UPDATE FORMATOS_PAPELERIA
            SET 
                nombre = '${f.nombre}',
                control_series = ${ctrl},
                rango_inicio = ${ini},
                rango_fin = ${fin}
            WHERE id_formato = ${id}
        `);
        res.json({ message: 'Format updated' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating format' });
    }
});

app.delete('/api/v1/formatos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();

        // Optional: Check usage in profiles before delete (integrity check)
        // For now, allow delete (constraints might fail if used in PERFILES_TRABAJO)

        await pool.request().query(`DELETE FROM FORMATOS_PAPELERIA WHERE id_formato = ${id}`);
        res.json({ message: 'Format deleted' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Error deleting format. It might be in use.' });
    }
});



// --- ASISTENCIA (ATTENDANCE) ---
app.get('/api/v1/attendance', async (req, res) => {
    try {
        const { date } = req.query;
        // FIX: Use local date to match DB
        const today = date || new Date().toLocaleDateString('en-CA');

        const pool = await getConnection();
        // Join with Employees to get names and photos
        // We use LEFT JOIN to include attendance even if employee was soft-deleted (though unlikely)
        // We also want to capture 'Absent' employees who don't have a record for today?
        // The frontend logic for 'Absent' was: Fetch All Employees, filter out those who attended.
        // So we just return the records here, and let frontend or a separate 'absent' logic handle it.
        // But wait, frontend wants a single list. 
        // Strategy: 
        // 1. Fetch Attendance Records for Date
        // 2. Fetch All Active Employees
        // 3. Return both or merged? 
        // To allow frontend refactor to be minimal, let's just return the records + employee details in the structure it expects.
        // The frontend currently does the "Absent" calculation itself. I will keep that logic there for now 
        // but I need to provide the 'employees' list endpoint or include it.
        // The frontend already fetches 'attendance_records' and 'employees'.

        const result = await pool.request()
            .input('date', sql.Date, today)
            .query(`
                SELECT 
                    ad.*, 
                    c.nombre as emp_name, 
                    c.rol as emp_role, 
                    c.photo_url as emp_photo,
                    c.phone as emp_phone,
                    c.estado_operativo as emp_status
                FROM ASISTENCIA_DIARIA ad
                LEFT JOIN COLABORADORES c ON ad.id_colaborador = c.id
                WHERE ad.fecha_asistencia = @date
                ORDER BY ad.hora_checkin ASC
            `);

        // Map to Frontend Structure (AttendanceRecord)
        const records = result.recordset.map(r => ({
            id: r.id_registro,
            employee_id: r.id_colaborador,
            date: r.fecha_asistencia.toISOString().split('T')[0],
            check_in_time: r.hora_checkin,
            location_lat: r.lat_checkin,
            location_lng: r.long_checkin,
            location_address: r.location_address,
            health_status: r.check_salud_apto ? 'saludable' : 'con_sintomas',
            system_status: r.estado_final,
            whatsapp_sync: r.whatsapp_sync,
            sync_date: r.sync_date,
            alert_status: r.alert_status,
            gps_justification: r.justificacion_geo,
            resolved_at: r.resolved_at,
            employee: {
                id: r.id_colaborador,
                name: r.emp_name,
                role: r.emp_role,
                photo_url: r.emp_photo,
                phone: r.emp_phone,
                estado_operativo: r.emp_status,
                active: true
            }
        }));

        res.json(records);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching attendance' });
    }
});

app.get('/api/v1/employees', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT * FROM COLABORADORES WHERE active = 1 ORDER BY nombre');
        res.json(result.recordset.map(e => ({
            id: e.id,
            name: e.nombre,
            role: e.rol,
            photo_url: e.photo_url,
            phone: e.phone,
            estado_operativo: e.estado_operativo,
            active: e.active
        })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching employees' });
    }
});

app.put('/api/v1/attendance/:id/sync', async (req, res) => {
    try {
        const { id } = req.params;
        const { whatsapp_sync } = req.body;
        const pool = await getConnection();

        await pool.request()
            .input('id', sql.VarChar, id)
            .input('sync', sql.Bit, whatsapp_sync ? 1 : 0)
            .input('date', sql.DateTime, whatsapp_sync ? new Date() : null)
            .query('UPDATE ASISTENCIA_DIARIA SET whatsapp_sync = @sync, sync_date = @date WHERE id_registro = @id');

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error syncing whatsapp status' });
    }
});

app.put('/api/v1/attendance/:id/resolve', async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body; // 'accept' | 'reject' | 'approve_exception' | 'reject_exception'
        const pool = await getConnection();

        const now = new Date();

        if (action === 'approve_exception') {
            await pool.request()
                .input('id', sql.VarChar, id)
                .input('resolved', sql.DateTime, now)
                .query("UPDATE ASISTENCIA_DIARIA SET estado_final = 'APROBADA_EXC', alert_status = 'exception_approved', resolved_at = @resolved WHERE id_registro = @id");
        } else if (action === 'reject_exception') {
            await pool.request()
                .input('id', sql.VarChar, id)
                .input('resolved', sql.DateTime, now)
                .query("UPDATE ASISTENCIA_DIARIA SET estado_final = 'RECHAZADA', alert_status = 'exception_rejected', resolved_at = @resolved WHERE id_registro = @id");
        } else if (action === 'accept') {
            await pool.request()
                .input('id', sql.VarChar, id)
                .input('alert', sql.VarChar, 'accepted')
                .input('final', sql.VarChar, 'presente') // Force present on accept
                .input('resolved', sql.DateTime, now)
                .query('UPDATE ASISTENCIA_DIARIA SET alert_status = @alert, estado_final = @final, resolved_at = @resolved WHERE id_registro = @id');
        } else {
            // reject
            await pool.request()
                .input('id', sql.VarChar, id)
                .input('alert', sql.VarChar, 'rejected')
                .input('resolved', sql.DateTime, now)
                .query('UPDATE ASISTENCIA_DIARIA SET alert_status = @alert, resolved_at = @resolved WHERE id_registro = @id');
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error resolving alert' });
    }
});


// --- PLANNING ---

app.get('/api/v1/zones', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT id_zona as id, nombre as name, codigo as code FROM ZONAS ORDER BY nombre');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching zones' });
    }
});

app.get('/api/v1/work-profiles', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT 
                id_perfil as id, 
                nombre as name,
                id_kit_material as default_material_kit_id,
                id_kit_documento as default_document_kit_id
            FROM PERFILES_TRABAJO 
            ORDER BY nombre
        `);
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching work profiles' });
    }
});

app.get('/api/v1/colaboradores/asistencia-hoy', async (req, res) => {
    try {
        // FIX: Use local date to match DB
        const today = new Date().toLocaleDateString('en-CA');
        const pool = await getConnection();

        // Fetch only those who marked attendance today and are present/late (not absent)
        // AND are effectively active (estado_operativo != BLOQUEADO_SALUD ideally, but let frontend handle warning)
        const result = await pool.request()
            .input('date', sql.Date, today)
            .query(`
                SELECT 
                    c.id, c.nombre, c.rol, c.photo_url, c.estado_operativo
                FROM ASISTENCIA_DIARIA ad
                INNER JOIN COLABORADORES c ON ad.id_colaborador = c.id
                WHERE ad.fecha_asistencia = @date 
                AND ad.estado_final IN ('presente', 'tardanza', 'APROBADA_EXC')
            `);

        res.json(result.recordset.map(r => ({
            id: r.id,
            name: r.nombre,
            role: r.rol,
            photo_url: r.photo_url,
            estado_operativo: r.estado_operativo
        })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching available employees' });
    }
});

app.get('/api/v1/vehiculos/operativos', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query("SELECT placa, marca, tipo_activo, max_volumen FROM VEHICULOS WHERE estado = 'OPERATIVO'");
        res.json(result.recordset.map(v => ({
            id: v.placa, // Frontend treats ID as string, for vehicles it's the plate
            plate: v.placa,
            model: v.marca,
            status: 'operativo',
            type: v.tipo_activo,
            volumen: v.max_volumen
        })));
    } catch (error) {
        res.status(500).json({ error: 'Error fetching active vehicles' });
    }
});

app.post('/api/v1/cuadrillas', async (req, res) => {
    try {
        const crews = req.body; // Array of crews
        const pool = await getConnection();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const request = new sql.Request(transaction);
            for (const crew of crews) {
                // Determine auxiliar ID (nullable)
                const auxId = crew.assistant_id ? crew.assistant_id : 'NULL';
                const now = new Date().toISOString();

                await request.query(`
                    INSERT INTO CUADRILLA_DIARIA (
                        id_cuadrilla, codigo, fecha_operacion, estado_planificacion,
                        id_lider, id_auxiliar, placa_vehiculo,
                        id_zona, id_perfil, id_kit_materiales, id_kit_documentos,
                        fecha_publicacion
                    ) VALUES (
                        '${crew.id}', '${crew.code}', '${now.split('T')[0]}', 'PUBLICADO',
                        ${crew.leader_id}, ${auxId}, '${crew.vehicle_id}',
                        ${crew.zone_id}, ${crew.work_profile_id}, ${crew.material_kit_id}, ${crew.document_kit_id},
                        GETDATE()
                    )
                `);
            }
            await transaction.commit();
            res.json({ message: 'Crews published successfully' });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error publishing crews' });
    }
});


app.get('/api/v1/cuadrillas', async (req, res) => {
    try {
        const { date } = req.query;
        // FIX: Use local date (en-CA gives YYYY-MM-DD) to match DB server time
        const targetDate = date ? String(date) : new Date().toLocaleDateString('en-CA');

        const pool = await getConnection();
        // Join with details to reconstruct the CrewCard
        const result = await pool.request()
            .input('date', sql.Date, targetDate)
            .query(`
                SELECT 
                    cd.*,
                    l.nombre as leader_name, l.photo_url as leader_photo,
                    a.nombre as assistant_name, a.photo_url as assistant_photo,
                    v.marca as vehicle_model, v.tipo_activo as vehicle_type,
                    z.nombre as zone_name,
                    pt.nombre as profile_name
                FROM CUADRILLA_DIARIA cd
                LEFT JOIN COLABORADORES l ON cd.id_lider = l.id
                LEFT JOIN COLABORADORES a ON cd.id_auxiliar = a.id
                LEFT JOIN VEHICULOS v ON cd.placa_vehiculo = v.placa
                LEFT JOIN ZONAS z ON cd.id_zona = z.id_zona
                LEFT JOIN PERFILES_TRABAJO pt ON cd.id_perfil = pt.id_perfil
                WHERE cd.fecha_operacion = @date
            `);

        const crews = result.recordset.map(r => ({
            id: r.id_cuadrilla,
            code: r.codigo,
            date: r.fecha_operacion.toISOString().split('T')[0],
            status: r.estado_planificacion,
            leader: r.id_lider ? { id: r.id_lider, name: r.leader_name, photo_url: r.leader_photo } : null,
            assistant: r.id_auxiliar ? { id: r.id_auxiliar, name: r.assistant_name, photo_url: r.assistant_photo } : null,
            vehicle: r.placa_vehiculo ? { id: r.placa_vehiculo, plate: r.placa_vehiculo, model: r.vehicle_model, type: r.vehicle_type } : null,
            zoneId: r.id_zona,
            workProfileId: r.id_perfil,
            materialKitId: r.id_kit_materiales,
            documentKitId: r.id_kit_documentos
        }));

        res.json(crews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching crews' });
    }
});

// --- DAILY OPERATIONS (WORK ORDERS) ---

// 1. GET Orders (Master Board)
app.get('/api/v1/work-orders', async (req, res) => {
    try {
        const pool = await getConnection();
        // Fetch orders joined with Crew Code if assigned
        // Note: For now, assuming basic fetch. Crew join logic to be added if 'assigned_crew_id' links to 'CUADRILLA_DIARIA.codigo' or ID
        const result = await pool.request().query(`
            SELECT TOP 500
                ot.*,
                l.fecha_carga as lote_fecha
            FROM ORDENES_TRABAJO ot
            INNER JOIN LOTE_IMPORTACION l ON ot.id_lote_origen = l.id_lote
            ORDER BY ot.fecha_creacion DESC
        `);

        // Map to frontend friendly format
        const orders = result.recordset.map(r => {
            let origin = r.cliente.toLowerCase().replace(/ /g, '_');
            if (origin === 'oca') origin = 'interno';

            return {
                id: r.id_ot,
                code: r.codigo_suministro,
                supply_id: r.codigo_suministro, // Alias for frontend compatibility
                client: r.cliente,
                work_type: r.tipo_trabajo,
                address: r.direccion_fisica,
                district: r.comuna,
                zone: r.sector,
                status: r.estado.toLowerCase(),
                origin: origin,
                priority: r.prioridad ? r.prioridad.toLowerCase() : 'media',
                scheduled_date: r.fecha_programada ? r.fecha_programada.toISOString().split('T')[0] : null,
                created_at: r.fecha_creacion,
                notes: r.notas,
                latitude: r.latitud,
                longitude: r.longitud
            };
        });

        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching work orders' });
    }
});

// 2. POST Batch (Inbox)
app.post('/api/v1/work-orders/batch', async (req, res) => {
    try {
        const { fileName, source, items } = req.body;
        // items is array of { code, client, address, district, priority, etc. }

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'No items to process' });
        }

        const pool = await getConnection();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const request = new sql.Request(transaction);

            // A. Create LOTE
            const loteResult = await request.query(`
                INSERT INTO LOTE_IMPORTACION (nombre_archivo_original, fuente_origen, total_registros, filas_validas, filas_error)
                OUTPUT INSERTED.id_lote
                VALUES ('${fileName}', '${source}', ${items.length}, ${items.length}, 0)
            `);
            const loteId = loteResult.recordset[0].id_lote;

            // B. Insert Orders
            // B. Insert Or Upsert Orders
            for (const item of items) {
                // Sanitize input slightly to prevent errors (basic String escaping)
                const safeAddress = (item.address || '').replace(/'/g, "''");
                const safeNotes = (item.notes || '').replace(/'/g, "''");
                const safePriority = item.priority.toUpperCase();

                // UUID for ID (if new)
                const newId = crypto.randomUUID();

                // Logic: Upsert based on codigo_suministro
                // If exists, update critical fields (address, priority, notes, lat/lng, scheduled_date)
                // If not, insert new
                await request.query(`
                    IF EXISTS (SELECT 1 FROM ORDENES_TRABAJO WHERE codigo_suministro = '${item.code}')
                    BEGIN
                        UPDATE ORDENES_TRABAJO
                        SET 
                            direccion_fisica = '${safeAddress}',
                            comuna = '${item.district}',
                            sector = '${item.zone || ''}',
                            tipo_trabajo = '${item.work_type}',
                            prioridad = '${safePriority}',
                            notas = '${safeNotes}',
                            fecha_programada = ${item.scheduled_date ? `'${item.scheduled_date}'` : 'NULL'},
                            latitud = ${item.latitude || 'NULL'},
                            longitud = ${item.longitude || 'NULL'},
                            id_lote_origen = ${loteId} -- Update source batch reference
                        WHERE codigo_suministro = '${item.code}'
                    END
                    ELSE
                    BEGIN
                        INSERT INTO ORDENES_TRABAJO (
                            id_ot, codigo_suministro, direccion_fisica, comuna, sector,
                            cliente, tipo_trabajo, estado, prioridad, notas,
                            id_lote_origen, fecha_creacion, fecha_programada,
                            latitud, longitud
                        ) VALUES (
                            '${newId}', '${item.code}', '${safeAddress}', '${item.district}', '${item.zone || ''}',
                            '${item.client}', '${item.work_type}', 'PENDIENTE', '${safePriority}', '${safeNotes}',
                            ${loteId}, GETDATE(), ${item.scheduled_date ? `'${item.scheduled_date}'` : 'NULL'},
                            ${item.latitude || 'NULL'}, ${item.longitude || 'NULL'}
                        )
                    END
                `);
            }

            await transaction.commit();
            res.json({ success: true, message: `Batch ${loteId} processed`, loteId });

        } catch (err) {
            await transaction.rollback();
            throw err;
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error processing batch' });
    }
});


// --- DISPATCH MAP ENDPOINTS ---

// A. Get Pending OTs (for Map)
app.get('/api/v1/ots/pendientes', async (req, res) => {
    try {
        const pool = await getConnection();
        // Return only orders with valid coordinates and PENDING status
        const result = await pool.request().query(`
            SELECT 
                id_ot, codigo_suministro, cliente, direccion_fisica, comuna, 
                latitud, longitud, prioridad, estado 
            FROM ORDENES_TRABAJO 
            WHERE estado = 'PENDIENTE' 
            AND latitud IS NOT NULL 
            AND longitud IS NOT NULL
        `);

        const orders = result.recordset.map(r => ({
            id: r.id_ot,
            code: r.codigo_suministro,
            client: r.cliente,
            address: r.direccion_fisica,
            district: r.comuna,
            status: r.estado.toLowerCase(),
            latitude: r.latitud,
            longitude: r.longitud,
            priority: r.prioridad ? r.prioridad.toLowerCase() : 'media',
            estimated_hours: 2 // Mock estimation for now
        }));

        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching pending orders' });
    }
});

// B. Get Available Crews (Published)
app.get('/api/v1/cuadrillas/disponibles', async (req, res) => {
    try {
        // Use query date or fallback to server local date (not UTC)
        const queryDate = req.query.date as string;
        let searchDate: string;

        if (queryDate) {
            searchDate = queryDate;
        } else {
            // Fallback to local time assumption if no date provided
            const local = new Date();
            local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
            searchDate = local.toISOString().split('T')[0];
        }

        console.log(`Fetching available crews for date: ${searchDate}`);

        const pool = await getConnection();

        const result = await pool.request()
            .input('date', sql.Date, searchDate)
            .query(`
                SELECT 
                    cd.id_cuadrilla, cd.codigo, cd.estado_planificacion,
                    cd.placa_vehiculo,
                    cd.id_zona,
                    -- Can add lat/lng from last known location if we track it (FUTURE)
                    -12.0464 as latitud, -- MOCK CENTER
                    -77.0428 as longitud -- MOCK CENTER
                FROM CUADRILLA_DIARIA cd
                WHERE CAST(cd.fecha_operacion AS DATE) = CAST(@date AS DATE)
                AND cd.estado_planificacion = 'PUBLICADO'
            `);

        // Need to calculate current capacity used?
        // Query assigned orders count/hours
        // This is complex in SQL in one go. Let's do a subquery or join if needed.
        // For MVP, return crews and let frontend sum assigned orders if we send them.

        // Actually, let's fetch assigned orders count for these crews
        const crews = result.recordset.map(r => ({
            id: r.id_cuadrilla,
            code: r.codigo,
            status: 'published',
            latitude: r.latitud + (Math.random() * 0.01 - 0.005), // Random jitter for demo
            longitude: r.longitud + (Math.random() * 0.01 - 0.005),
            current_capacity: 0, // Frontend will calculate or we fetch assignments
            max_capacity: 8,
            assigned_orders: [] as string[] // To be populated if we want persistent state
        }));

        // Fetch valid assignments for today? 
        // Logic: Orders assigned to these crews.
        const crewIds = crews.map(c => `'${c.id}'`).join(',');
        if (crewIds.length > 0) {
            const assignmentsResult = await pool.request().query(`
                SELECT id_ot, id_cuadrilla_asignada, 2 as estimated -- Mock hours
                FROM ORDENES_TRABAJO 
                WHERE id_cuadrilla_asignada IN (${crewIds})
                AND estado = 'ASIGNADO'
            `);

            assignmentsResult.recordset.forEach(a => {
                const crew = crews.find(c => c.id === a.id_cuadrilla_asignada);
                if (crew) {
                    crew.assigned_orders.push(a.id_ot);
                    crew.current_capacity += a.estimated;
                }
            });
        }

        res.json(crews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching crews' });
    }
});

// C. Assign Orders Batch
app.post('/api/v1/ots/asignar-lote', async (req, res) => {
    try {
        const { crewId, orderIds } = req.body;
        // orderIds is array of strings (OT IDs)
        if (!crewId || !orderIds || orderIds.length === 0) {
            return res.status(400).json({ error: 'Invalid payload' });
        }

        const pool = await getConnection();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const request = new sql.Request(transaction);

            // Loop to update providing sequence order (1, 2, 3 based on array index)
            let sequence = 1;
            for (const orderId of orderIds) {
                await request.query(`
                    UPDATE ORDENES_TRABAJO
                    SET 
                        estado = 'ASIGNADO',
                        id_cuadrilla_asignada = '${crewId}',
                        orden_visita = ${sequence}
                    WHERE id_ot = '${orderId}'
                `);
                sequence++;
            }

            await transaction.commit();
            res.json({ success: true, message: 'Orders assigned successfully' });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error assigning orders' });
    }
});

// 3. DELETE Batch (Master Board)
app.delete('/api/v1/work-orders/batch', async (req, res) => {
    try {
        const { ids } = req.body; // Array of UUIDs
        if (!ids || ids.length === 0) {
            return res.status(400).json({ error: 'No IDs provided' });
        }

        const pool = await getConnection();
        // Construct a safe list of IDs for the query (though we should use TVP or JSON in real prod, IN clause is fine for small batches)
        // Sanitizing IDs to ensure they are valid UUIDs/Strings to prevent injection is good practice, but simplistic here:
        const idList = ids.map((id: string) => `'${id}'`).join(',');

        await pool.request().query(`
            DELETE FROM ORDENES_TRABAJO
            WHERE id_ot IN (${idList})
        `);

        res.json({ success: true, message: `${ids.length} órdenes eliminadas` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error deleting orders' });
    }
});

// 4. PATCH Status (Master Board)
app.patch('/api/v1/work-orders/status', async (req, res) => {
    try {
        const { ids, status } = req.body; // ids: [], status: string
        if (!ids || ids.length === 0 || !status) {
            return res.status(400).json({ error: 'Invalid payload' });
        }

        const pool = await getConnection();
        const idList = ids.map((id: string) => `'${id}'`).join(',');

        await pool.request().query(`
            UPDATE ORDENES_TRABAJO
            SET estado = '${status.toUpperCase()}'
            WHERE id_ot IN (${idList})
        `);

        res.json({ success: true, message: `${ids.length} órdenes actualizadas a ${status}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating status' });
    }
});


// --- PHASE 4: EXECUTION & MONITORING ROUTES ---

// 1. Execution Monitor (Supervisor Dashboard)
app.get('/api/v1/execution/monitor', async (req, res) => {
    try {
        const pool = await getConnection();
        // Query to get OTs in EXECUTION or recently CLOSED
        // We filter by TODAY's local date or just active execution

        // Simple Logic: Get everything "In Progress" OR "Closed Today"
        const result = await pool.request().query(`
            SELECT 
                ot.id_ot, ot.codigo_suministro, ot.estado,
                ot.hora_inicio_real, ot.hora_fin_real,
                ot.cliente, ot.direccion_fisica, ot.tipo_trabajo,
                ot.latitud, ot.longitud,
                
                c.codigo as cuadrilla_codigo,
                
                -- Calculated duration in minutes (live)
                CASE 
                    WHEN ot.estado = 'EJECUCION' THEN DATEDIFF(MINUTE, ot.hora_inicio_real, GETDATE())
                    WHEN ot.estado IN ('CERRADA_TECNICO', 'FALLIDA') THEN DATEDIFF(MINUTE, ot.hora_inicio_real, ot.hora_fin_real)
                    ELSE 0
                END as duracion_minutos
                
            FROM ORDENES_TRABAJO ot
            LEFT JOIN CUADRILLA_DIARIA c ON ot.id_cuadrilla_asignada = c.id_cuadrilla
            WHERE ot.estado IN ('EJECUCION', 'CERRADA_TECNICO', 'FALLIDA')
            AND (
                ot.estado = 'EJECUCION' 
                OR CAST(ot.fecha_programada AS DATE) = CAST(GETDATE() AS DATE)
                OR CAST(ot.hora_fin_real AS DATE) = CAST(GETDATE() AS DATE)
            )
            ORDER BY ot.hora_inicio_real DESC
        `);

        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching execution monitor:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 2. OT Details (Digital Record / Expediente)
app.get('/api/v1/execution/details/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getConnection();

        // A. Basic OT Info with Financial Context
        const otResult = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .query(`
                SELECT 
                    ot.*,
                    cd.placa_vehiculo, cd.id_lider, cd.id_auxiliar,
                    (SELECT SUM(cm.cantidad * 15) FROM CONSUMO_MATERIALES cm WHERE cm.id_ot = ot.id_ot) as precio_total
                FROM ORDENES_TRABAJO ot
                LEFT JOIN CUADRILLA_DIARIA cd ON ot.id_cuadrilla_asignada = cd.id_cuadrilla
                WHERE ot.id_ot = @id
            `);

        if (otResult.recordset.length === 0) {
            return res.status(404).json({ error: 'OT not found' });
        }

        const rawOrder = otResult.recordset[0];

        // Calculate Costs (Same Logic as Liquidation Candidates)
        // 1. Material Cost (Sum of items)
        // We need to fetch materials first to sum them properly or use subquery.
        // Let's use the fetched materials below for accuracy if we want or just SQL sum.
        // Let's use SQL logic for consistency with previous step.

        // 1. Labor
        let cost_mo = 0;
        if (rawOrder.id_lider) cost_mo += 50;
        if (rawOrder.id_auxiliar) cost_mo += 30;

        // 2. Fleet
        let cost_fleet = 0;
        if (rawOrder.placa_vehiculo) cost_fleet += 20;

        // 3. Materials
        // We'll calculate this from the materials result for precision
        const materialsResult = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .query(`
                SELECT * FROM CONSUMO_MATERIALES WHERE id_ot = @id
            `);

        const materials = materialsResult.recordset;
        const cost_mat = materials.reduce((sum: number, m: any) => {
            const unitCost = m.cod_material.includes('COSTOSO') ? 20 : 10;
            return sum + (m.cantidad * unitCost);
        }, 0);

        const cost_total = cost_mat + cost_mo + cost_fleet;
        const price = rawOrder.precio_total || 0;
        const margin = price - cost_total;

        // Attach financial info to order object
        const orderWithFinance = {
            ...rawOrder,
            cost_mat,
            cost_mo,
            cost_fleet,
            cost_total,
            price,
            margin
        };

        // B. Material Consumption (Kardex) - Already fetched above
        // just use materials result

        // C. Evidence associated
        const evidenceResult = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .query(`
                SELECT * FROM EVIDENCIAS WHERE id_ot = @id
            `);

        res.json({
            order: orderWithFinance,
            materials: materials,
            evidence: evidenceResult.recordset
        });

    } catch (err) {
        console.error('Error fetching OT details:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// --- PHASE 5: QUALITY CONTROL ROUTES (AUDITOR) ---

// 1. Quality Inbox (Priority based)
app.get('/api/v1/quality/inbox', async (req, res) => {
    try {
        const pool = await getConnection();
        // Get Closed OTs, prioritized by flag
        const result = await pool.request().query(`
            SELECT 
                ot.id_ot, ot.codigo_suministro, ot.cliente, ot.estado,
                ot.hora_fin_real, ot.flag_prioridad_calidad,
                ot.tipo_trabajo, ot.direccion_fisica,
                
                -- Count evidence for preview
                (SELECT COUNT(*) FROM EVIDENCIAS e WHERE e.id_ot = ot.id_ot) as total_evidencias,
                
                -- Check for surpluses
                (SELECT COUNT(*) FROM CONSUMO_MATERIALES cm WHERE cm.id_ot = ot.id_ot AND cm.es_excedente = 1) as total_excedentes

            FROM ORDENES_TRABAJO ot
            WHERE ot.estado IN ('CERRADA_TECNICO', 'OBSERVADA', 'COMPLETADO')
            ORDER BY ot.flag_prioridad_calidad DESC, ot.hora_fin_real ASC
        `);

        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching quality inbox:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 2. Commit Audit (Approve/Reject + Log)
app.post('/api/v1/quality/audit', async (req, res) => {
    const transaction = new sql.Transaction(await getConnection());
    try {
        const { id_ot, nuevo_estado, comentario, cambios } = req.body;
        // cambios: [{ campo: 'cantidad', material_cod: 'XYZ', valor_ant: 5, valor_nuevo: 4 }]

        await transaction.begin();

        // A. Update OT Status
        await transaction.request().query(`
            UPDATE ORDENES_TRABAJO 
            SET estado = '${nuevo_estado}'
            WHERE id_ot = '${id_ot}'
        `);

        // B. Apply Data Corrections (if any) - For now simplified to Material Quantity
        if (cambios && cambios.length > 0) {
            for (const c of cambios) {
                if (c.tipo === 'MATERIAL') {
                    await transaction.request().query(`
                        UPDATE CONSUMO_MATERIALES
                        SET cantidad = ${c.valor_nuevo}
                        WHERE id_ot = '${id_ot}' AND cod_material = '${c.material_cod}'
                    `);
                }

                // C. Log to AUDITORIA_LOG
                await transaction.request().query(`
                    INSERT INTO AUDITORIA_LOG (id_ot, campo_afectado, valor_original, valor_final, comentario_auditoria)
                    VALUES ('${id_ot}', '${c.campo} (${c.material_cod})', '${c.valor_ant}', '${c.valor_nuevo}', '${comentario}')
                `);
            }
        } else {
            // Log simple status change if no data changed
            await transaction.request().query(`
                    INSERT INTO AUDITORIA_LOG (id_ot, campo_afectado, valor_original, valor_final, comentario_auditoria)
                    VALUES ('${id_ot}', 'ESTADO', 'CERRADA_TECNICO', '${nuevo_estado}', '${comentario}')
                `);
        }

        await transaction.commit();
        res.json({ success: true });

    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error('Error committing audit:', err);
        res.status(500).json({ error: 'Failed to commit audit' });
    }
});


// --- PHASE 6: LIQUIDATION & BILLING ROUTES (FINANCIAL) ---

// 1. Profitability Dashboard (Candidates for Billing)
app.get('/api/v1/liquidation/candidates', async (req, res) => {
    try {
        const pool = await getConnection();
        // Get Validated OTs not yet assigned to a batch
        const result = await pool.request().query(`
            SELECT 
                ot.id_ot, ot.codigo_suministro, ot.cliente, 
                ot.fecha_programada, ot.tipo_trabajo,
                ot.flag_extemporanea, ot.justificacion_tardia,
                
                -- Join Crew Info for Costing
                cd.placa_vehiculo,
                cd.id_lider,
                cd.id_auxiliar,

                -- 1. MATERIAL COST (Simulated Loss for specific items)
                (
                    SELECT ISNULL(SUM(
                        cm.cantidad * 
                        CASE 
                            WHEN cm.cod_material LIKE '%COSTOSO%' THEN 20 
                            ELSE 10 
                        END
                    ), 0)
                    FROM CONSUMO_MATERIALES cm WHERE cm.id_ot = ot.id_ot
                ) as costo_materiales,

                -- 2. REVENUE (Price)
                (
                    SELECT ISNULL(SUM(cm.cantidad * 15), 0)
                    FROM CONSUMO_MATERIALES cm WHERE cm.id_ot = ot.id_ot
                ) as precio_total

            FROM ORDENES_TRABAJO ot
            LEFT JOIN CUADRILLA_DIARIA cd ON ot.id_cuadrilla_asignada = cd.id_cuadrilla
            WHERE ot.estado IN ('VALIDADA_OK', 'VALIDADA_CON_AJUSTE')
            AND ot.id_lote_asignado IS NULL
            ORDER BY ot.fecha_programada DESC
        `);

        // Calculate Full Costs in JS
        const enriched = result.recordset.map(r => {
            // Labor Cost Rules (Mock Rates)
            let laborCost = 0;
            if (r.id_lider) laborCost += 50;   // Lider daily allocation per OT (simplified)
            if (r.id_auxiliar) laborCost += 30; // Auxiliar daily allocation per OT

            // Fleet Cost Rules
            let fleetCost = 0;
            if (r.placa_vehiculo) fleetCost += 20; // Fuel/Wear allocation per OT

            const materialCost = r.costo_materiales || 0;
            const totalCost = materialCost + laborCost + fleetCost;

            const price = r.precio_total || 0;
            const margin = price - totalCost;
            const marginPercent = price > 0 ? (margin / price) * 100 : 0;

            return {
                ...r,
                cost_mat: materialCost,
                cost_mo: laborCost,
                cost_fleet: fleetCost,
                cost_total: totalCost,
                price,
                margin,
                marginPercent
            };
        });

        res.json(enriched);
    } catch (err) {
        console.error('Error fetching liquidation candidates:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 2. Generate Billing Batch (Commit & Lock)
app.post('/api/v1/liquidation/generate-batch', async (req, res) => {
    const transaction = new sql.Transaction(await getConnection());
    try {
        const { selectedOtIds, clientName, month } = req.body;
        // selectedOtIds: string[]

        await transaction.begin();

        // A. Create Batch Header
        // Generate code like 'VAL-2025-10-001' (Simplified for demo)
        const batchCode = `VAL-${month}-${Math.floor(Math.random() * 1000)}`;

        const batchRes = await transaction.request().query(`
            INSERT INTO LOTE_VALORIZACION (codigo_lote, cliente, mes_valorizacion, estado, total_facturado)
            OUTPUT INSERTED.id_lote
            VALUES ('${batchCode}', '${clientName}', '${month}', 'BORRADOR', 0)
        `);
        const batchId = batchRes.recordset[0].id_lote;

        // B. Lock OTs and Link to Batch
        let totalAmount = 0;

        // We need to fetch current prices to save snapshot (Simplified: just using the calculated total from previous step logic)
        // In a real scenario, we'd fetch precise line items.
        // For this demo, we just lock the OTs.

        for (const otId of selectedOtIds) {
            await transaction.request().query(`
                UPDATE ORDENES_TRABAJO
                SET id_lote_asignado = ${batchId},
                    estado = 'FACTURACION_EN_PROCESO'
                WHERE id_ot = '${otId}'
            `);
        }

        // C. Update Total (Simplification: assuming frontend sends total or we recalc)
        // Ignoring calc for speed in this demo step.

        await transaction.commit();
        res.json({ success: true, batchCode });

    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error('Error generating batch:', err);
        res.status(500).json({ error: 'Failed to generate batch' });
    }
});

// 3. Get Batches History
app.get('/api/v1/liquidation/batches', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT 
                l.id_lote, l.codigo_lote, l.cliente, l.mes_valorizacion, 
                l.estado, l.fecha_generacion, l.total_facturado,
                l.numero_hes, l.fecha_aprobacion_hes, l.fecha_pago_probable,
                (SELECT COUNT(*) FROM ORDENES_TRABAJO ot WHERE ot.id_lote_asignado = l.id_lote) as total_ots
            FROM LOTE_VALORIZACION l 
            ORDER BY l.fecha_generacion DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching batches:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 4. Get Batch Details (OTs in a specific batch)
app.get('/api/v1/liquidation/batches/:id/details', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();

        const result = await pool.request()
            .input('batchId', sql.Int, id)
            .query(`
SELECT
ot.id_ot, ot.codigo_suministro, ot.cliente,
    ot.fecha_programada, ot.tipo_trabajo,
    ot.flag_extemporanea, ot.justificacion_tardia,
    ot.estado,

    --Join Crew Info for Costing
                cd.placa_vehiculo,
    cd.id_lider,
    cd.id_auxiliar,

    --1. MATERIAL COST
        (
            SELECT ISNULL(SUM(
                cm.cantidad *
                CASE 
                            WHEN cm.cod_material LIKE '%COSTOSO%' THEN 20 
                            ELSE 10 
                        END
            ), 0)
                    FROM CONSUMO_MATERIALES cm WHERE cm.id_ot = ot.id_ot
        ) as costo_materiales,

        --2. REVENUE(Price)
            (
                SELECT ISNULL(SUM(cm.cantidad * 15), 0)
                    FROM CONSUMO_MATERIALES cm WHERE cm.id_ot = ot.id_ot
            ) as precio_total

            FROM ORDENES_TRABAJO ot
            LEFT JOIN CUADRILLA_DIARIA cd ON ot.id_cuadrilla_asignada = cd.id_cuadrilla
            WHERE ot.id_lote_asignado = @batchId
            ORDER BY ot.fecha_programada DESC
    `);

        // Calculate Costs (Same logic as candidates)
        const enriched = result.recordset.map(r => {
            let laborCost = 0;
            if (r.id_lider) laborCost += 50;
            if (r.id_auxiliar) laborCost += 30;

            let fleetCost = 0;
            if (r.placa_vehiculo) fleetCost += 20;

            const materialCost = r.costo_materiales || 0;
            const totalCost = materialCost + laborCost + fleetCost;

            const price = r.precio_total || 0;
            const margin = price - totalCost;
            const marginPercent = price > 0 ? (margin / price) * 100 : 0;

            return {
                ...r,
                cost_mat: materialCost,
                cost_mo: laborCost,
                cost_fleet: fleetCost,
                cost_total: totalCost,
                price,
                margin,
                marginPercent
            };
        });

        res.json(enriched);

    } catch (err) {
        console.error('Error fetching batch details:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// HES Schema Helper
async function ensureHesSchema() {
    try {
        const pool = await getConnection();
        await pool.request().query(`
            IF NOT EXISTS(SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('LOTE_VALORIZACION') AND name = 'numero_hes')
                ALTER TABLE LOTE_VALORIZACION ADD numero_hes NVARCHAR(50) NULL;
            
            IF NOT EXISTS(SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('LOTE_VALORIZACION') AND name = 'fecha_aprobacion_hes')
                ALTER TABLE LOTE_VALORIZACION ADD fecha_aprobacion_hes DATETIME NULL;
            
            IF NOT EXISTS(SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('LOTE_VALORIZACION') AND name = 'fecha_pago_probable')
                ALTER TABLE LOTE_VALORIZACION ADD fecha_pago_probable DATETIME NULL;
`);
        console.log('HES Schema validated.');
    } catch (e) {
        console.error('Schema validation warning (might effectively exist):', e);
    }
}

// 5. Register HES (Conformidad Logic)
app.post('/api/v1/liquidation/batches/:id/register-hes', async (req, res) => {
    const transaction = new sql.Transaction(await getConnection());
    try {
        const { id } = req.params;
        const { numero_hes, fecha_aprobacion_hes } = req.body;

        // Business Rule: Calc Payment Date (e.g., Net 30 from Approval)
        const approvalDate = new Date(fecha_aprobacion_hes);
        const paymentDate = new Date(approvalDate);
        paymentDate.setDate(paymentDate.getDate() + 30); // 30 days credit

        await transaction.begin();

        // A. Update Batch Header
        await transaction.request()
            .input('hes', sql.NVarChar, numero_hes)
            .input('approval', sql.DateTime, approvalDate)
            .input('payment', sql.DateTime, paymentDate)
            .input('bid', sql.Int, id)
            .query(`
                UPDATE LOTE_VALORIZACION
                SET numero_hes = @hes,
    fecha_aprobacion_hes = @approval,
    fecha_pago_probable = @payment,
    estado = 'CONFORMIDAD_TOTAL'
                WHERE id_lote = @bid
    `);

        // B. Lock OTs (Financial Lock)
        await transaction.request()
            .input('bid', sql.Int, id)
            .query(`
                UPDATE ORDENES_TRABAJO
                SET estado = 'BLOQUEADA_FINANCIERA'
                WHERE id_lote_asignado = @bid
    `);

        await transaction.commit();
        res.json({ success: true, paymentDate, estado: 'CONFORMIDAD_TOTAL' });

    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error('Error registering HES:', err);
        res.status(500).json({ error: 'Failed to register HES' });
    }
});

// 6. Register Fleet Inspection
app.post('/api/v1/fleet/inspection', async (req, res) => {
    const transaction = new sql.Transaction(await getConnection());
    try {
        const { placa, kilometraje, tipo_evento, checklist_data, conductor, observaciones } = req.body;

        await transaction.begin();

        // A. Insert Registry
        await transaction.request()
            .input('placa', sql.NVarChar, placa)
            .input('tipo', sql.NVarChar, tipo_evento) // Fix: use tipo variable
            .input('km', sql.Int, kilometraje)
            .input('checklist', sql.NVarChar, JSON.stringify(checklist_data || {}))
            .input('cond', sql.NVarChar, conductor)
            .input('obs', sql.NVarChar, observaciones)
            .query(`
                INSERT INTO REGISTRO_VEHICULAR (placa, tipo_evento, kilometraje, checklist_data, conductor, observaciones)
                VALUES (@placa, @tipo, @km, @checklist, @cond, @obs)
            `);

        // B. Update Vehicle Master
        let newStatus = 'OPERATIVO';
        const checklistObj = checklist_data || {};

        if (checklistObj.frenos === false || checklistObj.direccion === false) {
            newStatus = 'TALLER';
        }

        await transaction.request()
            .input('placa', sql.NVarChar, placa)
            .input('km', sql.Int, kilometraje)
            .input('status', sql.NVarChar, newStatus)
            .query(`
                UPDATE VEHICULOS 
                SET ultimo_km_registrado = @km,
                    estado = CASE WHEN @status = 'TALLER' THEN 'TALLER' ELSE estado END
                WHERE placa = @placa
            `);

        await transaction.commit();
        res.json({ success: true, newStatus });

    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error('Error registering inspection:', err);
        res.status(500).json({ error: 'Failed to register inspection' });
    }
});
// 7. Fleet Monitor
app.get('/api/v1/fleet/monitor', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(`
             SELECT 
                v.placa, v.marca, v.tipo_activo, v.estado,
                v.ultimo_km_registrado, v.proximo_mant_km,
                (v.ultimo_km_registrado - v.proximo_mant_km) as excedente_km,
                r.fecha_registro as ultima_inspeccion,
                r.conductor as ultimo_conductor
            FROM VEHICULOS v
            OUTER APPLY (
                SELECT TOP 1 * FROM REGISTRO_VEHICULAR rv 
                WHERE rv.placa = v.placa 
                ORDER BY rv.fecha_registro DESC
            ) r
            ORDER BY v.estado ASC, v.placa ASC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fleet monitor:', err);
        res.json([]);
    }
});

// 8. Fleet Helper
async function ensureFleetSchema() {
    try {
        const pool = await getConnection();

        // Update VEHICULOS
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('VEHICULOS') AND name = 'ultimo_km_registrado')
                ALTER TABLE VEHICULOS ADD ultimo_km_registrado INT DEFAULT 0;

            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('VEHICULOS') AND name = 'proximo_mant_km')
                ALTER TABLE VEHICULOS ADD proximo_mant_km INT DEFAULT 5000;
        `);

        // Create REGISTRO_VEHICULAR
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'REGISTRO_VEHICULAR')
            BEGIN
                CREATE TABLE REGISTRO_VEHICULAR (
                    id_registro INT IDENTITY(1,1) PRIMARY KEY,
                    placa NVARCHAR(50) NOT NULL,
                    fecha_registro DATETIME DEFAULT GETDATE(),
                    tipo_evento NVARCHAR(50) NOT NULL,
                    kilometraje INT NOT NULL,
                    checklist_data NVARCHAR(MAX),
                    conductor NVARCHAR(100),
                    observaciones NVARCHAR(MAX)
                );
                CREATE INDEX IDX_REGISTRO_PLACA ON REGISTRO_VEHICULAR(placa);
            END
        `);
        console.log('Fleet Schema validated.');
    } catch (e) {
        console.error('Fleet schema validation warning:', e);
    }
}

// 9. Get Vehicle History
app.get('/api/v1/fleet/:placa/history', async (req, res) => {
    try {
        const { placa } = req.params;
        const pool = await getConnection();
        const result = await pool.request()
            .input('placa', sql.NVarChar, placa)
            .query(`
                SELECT TOP 50 *
    FROM REGISTRO_VEHICULAR 
                WHERE placa = @placa 
                ORDER BY fecha_registro DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching history' });
    }
});

// 10. Telemetry / GPS
app.post('/api/v1/telemetry', async (req, res) => {
    try {
        const { placa, lat, lng, speed, heading, event_type } = req.body;
        const pool = await getConnection();

        await pool.request()
            .input('placa', sql.NVarChar, placa)
            .input('lat', sql.Decimal(9, 6), lat)
            .input('lng', sql.Decimal(9, 6), lng)
            .input('speed', sql.Int, speed || 0)
            .input('heading', sql.Int, heading || 0)
            .input('evt', sql.NVarChar, event_type || 'PING')
            .query(`
                INSERT INTO VEHICLE_TRACKING_LOGS (placa, lat, lng, speed, heading, event_type)
                VALUES (@placa, @lat, @lng, @speed, @heading, @evt)
            `);

        res.json({ success: true });
    } catch (err) {
        console.error('Error telemetry ingest:', err);
        res.status(500).json({ error: 'Ingest failed' });
    }
});

app.get('/api/v1/telemetry/:placa/latest', async (req, res) => {
    try {
        const { placa } = req.params;
        const pool = await getConnection();
        const result = await pool.request()
            .input('placa', sql.NVarChar, placa)
            .query(`
                SELECT TOP 1 * FROM VEHICLE_TRACKING_LOGS 
                WHERE placa = @placa 
                ORDER BY timestamp DESC
            `);
        res.json(result.recordset[0] || null);
    } catch (err) {
        res.status(500).json({ error: 'Fetch latest failed' });
    }
});

app.get('/api/v1/telemetry/live', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT t.* 
            FROM VEHICLE_TRACKING_LOGS t
            INNER JOIN (
                SELECT placa, MAX(timestamp) as MaxTime
                FROM VEHICLE_TRACKING_LOGS
                GROUP BY placa
            ) tm ON t.placa = tm.placa AND t.timestamp = tm.MaxTime
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching live fleet:', err);
        res.status(500).json({ error: 'Fetch live failed' });
    }
});

app.get('/api/v1/telemetry/:placa/route', async (req, res) => {
    try {
        const { placa } = req.params;
        const { date } = req.query; // YYYY-MM-DD
        const pool = await getConnection();

        // Default to today if no date
        const filterDate = date ? String(date) : new Date().toISOString().split('T')[0];

        const result = await pool.request()
            .input('placa', sql.NVarChar, placa)
            .input('date', sql.Date, filterDate)
            .query(`
                SELECT lat, lng, timestamp, speed 
                FROM VEHICLE_TRACKING_LOGS 
                WHERE placa = @placa 
                AND CAST(timestamp AS DATE) = @date
                ORDER BY timestamp ASC
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'Fetch route failed' });
    }
});

// Telemetry Logic Helper
async function ensureTelemetrySchema() {
    try {
        const pool = await getConnection();
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'VEHICLE_TRACKING_LOGS')
            BEGIN
                CREATE TABLE VEHICLE_TRACKING_LOGS (
                    id_log BIGINT IDENTITY(1,1) PRIMARY KEY,
                    placa NVARCHAR(50) NOT NULL,
                    lat DECIMAL(9,6) NOT NULL,
                    lng DECIMAL(9,6) NOT NULL,
                    speed INT DEFAULT 0,
                    heading INT DEFAULT 0,
                    timestamp DATETIME DEFAULT GETDATE(),
                    event_type NVARCHAR(50) DEFAULT 'PING'
                );
                CREATE INDEX IDX_TRACKING_PLACA_TIME ON VEHICLE_TRACKING_LOGS(placa, timestamp);
            END
        `);
        console.log('Telemetry Schema validated.');
    } catch (e) {
        console.error('Telemetry schema validation warning:', e);
    }
}

// --- 8. Analytics & Scoring (Phase 10) ---

app.get('/api/v1/analytics/fleet-score', async (req, res) => {
    try {
        const pool = await getConnection();

        // Complex query to aggregate behavior
        // 1. Get raw counts of violations
        // 2. Calculate score
        const result = await pool.request().query(`
            WITH Violations AS (
                SELECT 
                    placa,
                    SUM(CASE WHEN speed > 90 THEN 1 ELSE 0 END) as speeding_events,
                    SUM(CASE WHEN event_type = 'GEOFENCE_EXIT' THEN 1 ELSE 0 END) as geofence_events
                FROM VEHICLE_TRACKING_LOGS
                GROUP BY placa
            )
            SELECT 
                v.placa,
                COALESCE(vi.speeding_events, 0) as speeding_count,
                COALESCE(vi.geofence_events, 0) as geofence_count,
                100 
                - (COALESCE(vi.speeding_events, 0) * 5) 
                - (COALESCE(vi.geofence_events, 0) * 10) 
                as safety_score
            FROM VEHICULOS v
            INNER JOIN CUADRILLA_DIARIA cd ON v.placa = cd.placa_vehiculo
            LEFT JOIN Violations vi ON v.placa = vi.placa
            WHERE cd.fecha_operacion = CAST(GETDATE() AS DATE)
            ORDER BY safety_score ASC
        `);

        // Post-process to ensure min score is 0 and add label
        const ranked = result.recordset.map((r: any) => {
            let score = Math.max(0, r.safety_score);
            let status = 'EXCELENTE';
            if (score < 70) status = 'RIESGOSO';
            else if (score < 90) status = 'REGULAR';

            return { ...r, safety_score: score, status };
        });

        res.json(ranked);
    } catch (err) {
        console.error('Error fetching fleet score:', err);
        res.status(500).json({ error: 'Failed to calc scores' });
    }
});

app.get('/api/v1/analytics/stats', async (req, res) => {
    try {
        const pool = await getConnection();

        // 1. Total Fleet Km (from Odometer in VEHICULOS)
        const kmResult = await pool.request().query("SELECT SUM(ultimo_km_registrado) as total_km FROM VEHICULOS");

        // 2. Active Vehicles (reported in last 24h)
        const activeResult = await pool.request().query(`
            SELECT COUNT(DISTINCT placa) as active_count 
            FROM VEHICLE_TRACKING_LOGS 
            WHERE timestamp > DATEADD(hour, -24, GETDATE())
        `);

        // 3. Total Vehicles
        const totalResult = await pool.request().query("SELECT COUNT(*) as total_count FROM VEHICULOS");

        res.json({
            total_km_traveled: kmResult.recordset[0].total_km || 0,
            active_vehicles: activeResult.recordset[0].active_count || 0,
            total_vehicles: totalResult.recordset[0].total_count || 0,
            utilization_rate: totalResult.recordset[0].total_count > 0
                ? Math.round((activeResult.recordset[0].active_count / totalResult.recordset[0].total_count) * 100)
                : 0
        });
    } catch (err) {
        console.error('Error fetching analytics stats:', err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// A.3 Get Crew Current Stock (360 View)
// Returns what the crew ALREADY has in custody (from previous days or returns)
app.get('/api/v1/logistics/crew-stock/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();

        // Get crew details to know vehicle and leader
        const crewRes = await pool.request().query(`SELECT placa_vehiculo, id_lider FROM CUADRILLA_DIARIA WHERE id_cuadrilla = '${id}'`);
        if (crewRes.recordset.length === 0) return res.json([]);

        const { placa_vehiculo, id_lider } = crewRes.recordset[0];

        // Get Leader DNI for custody check
        const leaderRes = await pool.request().query(`SELECT dni FROM COLABORADORES WHERE id = '${id_lider}'`);
        const lider_dni = leaderRes.recordset[0]?.dni;

        // Query Custody
        // We look for items assigned to the Vehicle (Plate) OR the Leader (DNI)
        // Corrected columns based on inspection: custodio_id, tipo_custodio
        const custodyRes = await pool.request().query(`
            SELECT 
                sc.id_material,
                m.nombre,
                sc.cantidad,
                sc.custodio_id as id_responsable,
                sc.tipo_custodio
            FROM STOCK_CUSTODIA sc
            JOIN CATALOGO_MATERIALES m ON sc.id_material = m.id_material
            WHERE sc.custodio_id IN ('${placa_vehiculo}', '${lider_dni}')
            AND sc.cantidad > 0
        `);

        res.json(custodyRes.recordset);
    } catch (err) {
        console.error('Error fetching crew stock:', err);
        res.status(500).json({ error: 'Failed to fetch crew stock' });
    }
});

// --- 9. HSE & Supervision (Phase 11) ---

app.post('/api/v1/hse/incident', async (req, res) => {
    const transaction = new sql.Transaction(await getConnection());
    try {
        const { id_cuadrilla, gravedad, descripcion, evidencia_url } = req.body;
        await transaction.begin();

        // 1. Register Incident
        await transaction.request()
            .input('crew', sql.NVarChar, id_cuadrilla)
            .input('sev', sql.NVarChar, gravedad)
            .input('desc', sql.NVarChar, descripcion)
            .input('url', sql.NVarChar, evidencia_url)
            .query(`
                INSERT INTO INCIDENTES (id_cuadrilla, gravedad, descripcion, evidencia_url)
                VALUES (@crew, @sev, @desc, @url)
            `);

        // 2. Trigger: Critical Incident -> Suspend Work
        if (gravedad === 'GRAVE' || gravedad === 'MORTAL') {
            await transaction.request()
                .input('crew', sql.NVarChar, id_cuadrilla)
                .query(`
                    UPDATE ORDENES_TRABAJO
                    SET estado = 'SUSPENDIDA_INCIDENTE',
                        justificacion_geo_ot = 'INCIDENTE CRITICO #' + CAST(SCOPE_IDENTITY() AS VARCHAR)
                    WHERE id_cuadrilla_asignada = @crew 
                    AND estado IN ('EJECUCION', 'PENDIENTE', 'ASIGNADO')
                `);
        }

        await transaction.commit();
        res.json({ success: true, message: 'Incident registered' });

    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error('Error hse incident:', err);
        res.status(500).json({ error: 'Failed to register incident' });
    }
});

app.get('/api/v1/hse/incidents', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT TOP 50 * FROM INCIDENTES 
            ORDER BY timestamp_inicio DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching incidents:', err);
        res.status(500).json({ error: 'Failed to fetch incidents' });
    }
});

app.post('/api/v1/hse/audit', async (req, res) => {
    const transaction = new sql.Transaction(await getConnection());
    try {
        const { id_colaborador, id_supervisor, score, resultado, motivo, checklist, id_ot } = req.body;
        await transaction.begin();

        // 1. Register Audit
        await transaction.request()
            .input('col', sql.Int, id_colaborador)
            .input('sup', sql.Int, id_supervisor)
            .input('score', sql.Int, score)
            .input('res', sql.NVarChar, resultado)
            .input('reason', sql.NVarChar, motivo)
            .input('json', sql.NVarChar, JSON.stringify(checklist))
            .input('ot', sql.NVarChar, id_ot)
            .query(`
                INSERT INTO AUDITORIA_SEGURIDAD (id_colaborador, id_supervisor, score, resultado, motivo_bloqueo, checklist_json, id_ot_vinculada)
                VALUES (@col, @sup, @score, @res, @reason, @json, @ot)
            `);

        // 2. Trigger: Lock Resource
        if (resultado === 'BLOQUEADO') {
            await transaction.request()
                .input('col', sql.Int, id_colaborador)
                .query(`
                    UPDATE COLABORADORES
                    SET estado_operativo = 'BLOQUEADO_SEGURIDAD'
                    WHERE id = @col
                `);
        }

        await transaction.commit();
        res.json({ success: true });
    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error('Error hse audit:', err);
        res.status(500).json({ error: 'Failed to register audit' });
    }
});

app.post('/api/v1/hse/unlock-resource', async (req, res) => {
    try {
        const { id_colaborador, pin } = req.body;
        // Mock PIN validation
        if (pin !== '1234') return res.status(403).json({ error: 'Invalid PIN' });

        const pool = await getConnection();
        await pool.request()
            .input('col', sql.Int, id_colaborador)
            .query(`
                UPDATE COLABORADORES
                SET estado_operativo = 'ACTIVO'
                WHERE id = @col
            `);

        res.json({ success: true, message: 'Unlocked' });
    } catch (err) {
        res.status(500).json({ error: 'Unlock failed' });
    }
});

app.post('/api/v1/logistics/reassign-crew', async (req, res) => {
    const transaction = new sql.Transaction(await getConnection());
    try {
        const { oldCrewId, newMemberId, newVehicleId } = req.body;
        await transaction.begin();

        // 1. Get Old Crew Data
        const oldCrewReq = await transaction.request()
            .input('oldId', sql.NVarChar, oldCrewId)
            .query("SELECT * FROM CUADRILLA_DIARIA WHERE id_cuadrilla = @oldId");

        if (oldCrewReq.recordset.length === 0) throw new Error('Crew not found');
        const oldCrew = oldCrewReq.recordset[0];
        const newVersion = (oldCrew.version || 1) + 1;
        const newCrewId = `${oldCrewId}_V${newVersion}`;

        // 2. Validate Paused State (Simplification: Just check if any OT in execution)
        // In real world, we would block if 'EJECUCION'. Assume frontend handles checks.

        // 3. Close Old Crew
        await transaction.request()
            .input('oldId', sql.NVarChar, oldCrewId)
            .query("UPDATE CUADRILLA_DIARIA SET estado_planificacion = 'CERRADA_ROTA' WHERE id_cuadrilla = @oldId");

        // 4. Create New Crew (Clone + Modify)
        await transaction.request()
            .input('newId', sql.NVarChar, newCrewId)
            .input('code', sql.NVarChar, oldCrew.codigo)
            .input('date', sql.Date, oldCrew.fecha_operacion)
            .input('lider', sql.Int, oldCrew.id_lider) // Assuming Leader stays same, or passed in params
            .input('aux', sql.Int, newMemberId || oldCrew.id_auxiliar)
            .input('veh', sql.NVarChar, newVehicleId || oldCrew.placa_vehiculo)
            .input('zone', sql.Int, oldCrew.id_zona)
            .input('perf', sql.Int, oldCrew.id_perfil)
            .input('kitm', sql.Int, oldCrew.id_kit_materiales)
            .input('kitd', sql.Int, oldCrew.id_kit_documentos)
            .input('orig', sql.NVarChar, oldCrewId)
            .input('ver', sql.Int, newVersion)
            .query(`
                INSERT INTO CUADRILLA_DIARIA (
                    id_cuadrilla, codigo, fecha_operacion, estado_planificacion,
                    id_lider, id_auxiliar, placa_vehiculo,
                    id_zona, id_perfil, id_kit_materiales, id_kit_documentos,
                    fecha_creacion, fecha_publicacion,
                    id_cuadrilla_origen, version
                ) VALUES (
                    @newId, @code, @date, 'PUBLICADO',
                    @lider, @aux, @veh,
                    @zone, @perf, @kitm, @kitd,
                    GETDATE(), GETDATE(),
                    @orig, @ver
                )
            `);

        // 5. Move Pending Work
        await transaction.request()
            .input('oldId', sql.NVarChar, oldCrewId)
            .input('newId', sql.NVarChar, newCrewId)
            .query(`
                UPDATE ORDENES_TRABAJO
                SET id_cuadrilla_asignada = @newId
                WHERE id_cuadrilla_asignada = @oldId
                AND estado IN ('PENDIENTE', 'ASIGNADO', 'SUSPENDIDA_INCIDENTE')
            `);

        await transaction.commit();
        res.json({ success: true, newCrewId });

    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error('Error reassigning crew:', err);
        res.status(500).json({ error: 'Failed to reassign crew' });
    }
});

// --- 10. Logistics & Warehouse (Phase 13) ---

// A. Get Pending Dispatches (Today's Crews without dispatch)
app.get('/api/v1/logistics/dispatches/pending', async (req, res) => {
    try {
        const pool = await getConnection();
        // Concept: List today's crews that clearly need materials but haven't received a "SALIDA_DESPACHO" today.
        // We link with CUADRILLA_DIARIA and check MOVIMIENTOS_ALMACEN
        const result = await pool.request().query(`
            SELECT 
                c.id_cuadrilla, 
                c.codigo, 
                c.placa_vehiculo, 
                col.nombre as lider_nombre,
                col.dni as lider_dni,
                c.id_kit_materiales,
                k.nombre_kit,
                k.composicion_kit
            FROM CUADRILLA_DIARIA c
            LEFT JOIN COLABORADORES col ON c.id_lider = col.id
            LEFT JOIN CATALOGO_KITS k ON c.id_kit_materiales = k.id_kit
            WHERE c.fecha_operacion = CAST(GETDATE() AS DATE)
            AND NOT EXISTS (
                SELECT 1 FROM MOVIMIENTOS_ALMACEN m 
                WHERE m.destino = c.placa_vehiculo -- Or check Lider DNI? Simplified to Vehicle check for dispatch
                AND m.tipo_movimiento = 'SALIDA_DESPACHO'
                AND CAST(m.fecha AS DATE) = CAST(GETDATE() AS DATE)
            )
        `);

        // Parse kit composition json
        const crews = result.recordset.map(r => ({
            ...r,
            composicion_kit: r.composicion_kit ? JSON.parse(r.composicion_kit) : []
        }));

        res.json(crews);
    } catch (err) {
        console.error('Error pending dispatches:', err);
        res.status(500).json({ error: 'Failed to fetch pending dispatches' });
    }
});

// A.2 Get Dispatched History (Today)
app.get('/api/v1/logistics/dispatches/history', async (req, res) => {
    try {
        const pool = await getConnection();
        // List crews that HAVE a dispatch today
        const result = await pool.request().query(`
            SELECT DISTINCT
                c.id_cuadrilla, 
                c.codigo, 
                c.placa_vehiculo, 
                col.nombre as lider_nombre,
                col.dni as lider_dni,
                c.id_kit_materiales,
                k.nombre_kit,
                k.composicion_kit
            FROM CUADRILLA_DIARIA c
            LEFT JOIN COLABORADORES col ON c.id_lider = col.id
            LEFT JOIN CATALOGO_KITS k ON c.id_kit_materiales = k.id_kit
            INNER JOIN MOVIMIENTOS_ALMACEN m ON m.documento_ref = 'DESPACHO-' + CAST(c.id_cuadrilla AS VARCHAR)
            WHERE c.fecha_operacion = CAST(GETDATE() AS DATE)
            AND m.tipo_movimiento = 'SALIDA_DESPACHO'
            AND CAST(m.fecha AS DATE) = CAST(GETDATE() AS DATE)
        `);

        const crews = result.recordset.map(r => ({
            ...r,
            composicion_kit: r.composicion_kit ? JSON.parse(r.composicion_kit) : []
        }));

        res.json(crews);
    } catch (err) {
        console.error('Error dispatch history:', err);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// A.3 Process Return (Reverse Logistics)
app.post('/api/v1/logistics/return', async (req, res) => {
    const transaction = new sql.Transaction(await getConnection());
    try {
        const { id_cuadrilla, items } = req.body;
        // items: [{ id_material, cantidad, estado: 'BUENO' | 'MALO' }]

        // Get crew info for metadata
        const pool = await getConnection();
        const crewRes = await pool.request().query(`SELECT placa_vehiculo FROM CUADRILLA_DIARIA WHERE id_cuadrilla = '${id_cuadrilla}'`);
        const placa = crewRes.recordset[0]?.placa_vehiculo || 'UNKNOWN';

        // 🛡️ SECURITY CHECK: Validate Stock Availability BEFORE Transaction
        // Prevent negative stock / fraud
        for (const item of items) {
            const stockRes = await pool.request()
                .input('crew', sql.NVarChar, placa)
                .input('mat', sql.NVarChar, item.id_material)
                .query('SELECT cantidad FROM STOCK_CUSTODIA WHERE custodio_id = @crew AND id_material = @mat');

            const currentStock = stockRes.recordset[0]?.cantidad || 0;
            if (item.cantidad > currentStock) {
                console.warn(`⚠️ Blocked invalid return: Asking to return ${item.cantidad}, but only has ${currentStock}`);
                return res.status(400).json({ error: `Saldo insuficiente. Tienes ${currentStock}, intentas devolver ${item.cantidad}.` });
            }
        }

        await transaction.begin();

        for (const item of items) {
            // 2. Decrement Custody
            await transaction.request()
                .input('crew', sql.NVarChar, placa) // Using Plate as Custodian Key
                .input('mat', sql.NVarChar, item.id_material)
                .input('qty', sql.Int, item.cantidad)
                .query(`
                    UPDATE STOCK_CUSTODIA 
                    SET cantidad = cantidad - @qty, ultima_actualizacion = GETDATE()
                    WHERE custodio_id = @crew AND id_material = @mat
                `);

            // 3. Increment Warehouse Stock (Only if Good Condition)
            if (item.estado === 'BUENO') {
                await transaction.request()
                    .input('mat', sql.NVarChar, item.id_material)
                    .input('qty', sql.Int, item.cantidad)
                    .query(`
                        UPDATE STOCK_ALMACEN
                        SET cantidad = cantidad + @qty, ultima_actualizacion = GETDATE()
                        WHERE id_material = @mat
                    `);
            }

            // 4. Register Movement
            await transaction.request()
                .input('type', sql.NVarChar, item.estado === 'BUENO' ? 'DEVOLUCION_BUEN_ESTADO' : 'RETORNO_CHATARRA')
                .input('mat', sql.NVarChar, item.id_material)
                .input('qty', sql.Int, item.cantidad)
                .input('org', sql.NVarChar, placa)
                .input('dest', sql.NVarChar, 'ALMACEN_CENTRAL')
                .input('ref', sql.NVarChar, `RET-${new Date().toISOString().split('T')[0]}-${placa}`)
                .input('user', sql.NVarChar, 'SYSTEM')
                .query(`
                    INSERT INTO MOVIMIENTOS_ALMACEN (tipo_movimiento, id_material, cantidad, origen, destino, documento_ref, usuario_responsable, fecha)
                    VALUES (@type, @mat, @qty, @org, @dest, @ref, @user, GETDATE())
                `);
        }

        await transaction.commit();
        res.json({ success: true, message: 'Return processed' });

    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error('Error processing return:', err);
        res.status(500).json({ error: 'Failed to process return' });
    }
});

// B. Perform Dispatch (Commit Stock Move)
app.post('/api/v1/logistics/dispatch', async (req, res) => {
    const transaction = new sql.Transaction(await getConnection());
    try {
        const { id_cuadrilla, placa, lider_dni, items, usuario_responsable } = req.body;

        // Validate Inputs
        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'No items to dispatch' });
        }

        await transaction.begin();

        for (const item of items) {
            const custodioId = item.tipo_custodio === 'VEHICULO' ? placa : lider_dni;
            if (!custodioId) {
                throw new Error(`Missing Custodian ID for type ${item.tipo_custodio}. Placa: ${placa}, DNI: ${lider_dni}`);
            }

            // 1. Decrement Warehouse Stock
            await transaction.request()
                .input('mat', sql.UniqueIdentifier, item.id_material)
                .input('qty', sql.Decimal(10, 2), item.cantidad)
                .query(`
                    MERGE STOCK_ALMACEN AS target
                    USING (SELECT 'MAIN' as id_almacen, @mat as id_material) AS source
                    ON (target.id_almacen = source.id_almacen AND target.id_material = source.id_material)
                    WHEN MATCHED THEN
                        UPDATE SET cantidad = cantidad - @qty, ultima_actualizacion = GETDATE()
                    WHEN NOT MATCHED THEN
                        INSERT (id_almacen, id_material, cantidad) VALUES ('MAIN', @mat, -@qty);
                `);

            // 2. Increment Custody Stock (Technical Location)
            await transaction.request()
                .input('custodio', sql.NVarChar, custodioId)
                .input('tipo', sql.NVarChar, item.tipo_custodio)
                .input('mat', sql.UniqueIdentifier, item.id_material)
                .input('qty', sql.Decimal(10, 2), item.cantidad)
                .query(`
                    MERGE STOCK_CUSTODIA AS target
                    USING (SELECT @custodio as custodio_id, @mat as id_material) AS source
                    ON (target.custodio_id = source.custodio_id AND target.id_material = source.id_material)
                    WHEN MATCHED THEN
                        UPDATE SET cantidad = cantidad + @qty, ultima_actualizacion = GETDATE()
                    WHEN NOT MATCHED THEN
                        INSERT (custodio_id, tipo_custodio, id_material, cantidad) 
                        VALUES (@custodio, @tipo, @mat, @qty);
                `);

            // 3. Log Movement
            await transaction.request()
                .input('tipo', sql.NVarChar, 'SALIDA_DESPACHO')
                .input('mat', sql.UniqueIdentifier, item.id_material)
                .input('qty', sql.Decimal(10, 2), item.cantidad)
                .input('orig', sql.NVarChar, 'MAIN')
                .input('dest', sql.NVarChar, custodioId)
                .input('user', sql.NVarChar, usuario_responsable || 'SYSTEM')
                .input('doc', sql.NVarChar, `DESPACHO-${id_cuadrilla}`)
                .query(`
                    INSERT INTO MOVIMIENTOS_ALMACEN (tipo_movimiento, id_material, cantidad, origen, destino, usuario_responsable, documento_ref)
                    VALUES (@tipo, @mat, @qty, @orig, @dest, @user, @doc)
                `);
        }

        await transaction.commit();
        res.json({ success: true, message: 'Dispatch successful' });

    } catch (err: any) {
        if (transaction) await transaction.rollback();
        console.error('Error dispatching:', err);
        // Return 500 but with error message if possible
        res.status(500).json({ error: err.message || 'Dispatch failed' });
    }
});

// C. Report Incident (Logistics)
app.post('/api/v1/logistics/incident', async (req, res) => {
    try {
        const pool = await getConnection();
        const { id_cuadrilla, tipo, comentario, usuario } = req.body;

        // Ensure we have a table or just log to console/generic table?
        // Let's us INCIDENTES table but it is HSE focused.
        // Let's create a logistics log in MOVIMIENTOS_ALMACEN with special type? 
        // Or just reusing INCIDENTES with severity 'LEVE'.

        await pool.request()
            .input('crew', sql.NVarChar, id_cuadrilla)
            .input('sev', sql.NVarChar, 'LEVE') // Low severity for logistics
            .input('desc', sql.NVarChar, `[LOGISTICA] ${tipo}: ${comentario}`)
            .query(`
                INSERT INTO INCIDENTES (id_cuadrilla, gravedad, descripcion, timestamp_inicio)
                VALUES (@crew, @sev, @desc, GETDATE())
            `);

        res.json({ success: true });
    } catch (err) {
        console.error('Error reporting incident:', err);
        res.status(500).json({ error: 'Failed' });
    }
});

// Start Server
app.listen(port, async () => {
    await ensureHesSchema();
    await ensureFleetSchema();
    await ensureTelemetrySchema();
    console.log(`Server running on port ${port} `);
});
