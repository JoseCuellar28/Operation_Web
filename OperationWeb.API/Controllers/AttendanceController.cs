using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OperationWeb.DataAccess;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OperationWeb.API.Controllers
{
    [Route("api/v1")]
    [ApiController]
    public class AttendanceController : ControllerBase
    {
        private readonly OperationWebDbContext _context;

        public AttendanceController(OperationWebDbContext context)
        {
            _context = context;
        }

        // DTOs matching Frontend expectations
        public class EmployeeDto
        {
            public int id { get; set; }
            public string? name { get; set; }
            public string? role { get; set; }
            public string? photo_url { get; set; }
            public string? phone { get; set; }
            public string? estado_operativo { get; set; }
            public bool active { get; set; }
        }

        public class AttendanceRecordDto
        {
            public string id { get; set; }
            public int employee_id { get; set; }
            public string date { get; set; }
            public string? check_in_time { get; set; }
            public decimal? location_lat { get; set; }
            public decimal? location_lng { get; set; }
            public string? location_address { get; set; }
            public string health_status { get; set; }
            public string system_status { get; set; }
            public bool whatsapp_sync { get; set; }
            public string? sync_date { get; set; }
            public string? alert_status { get; set; }
            public string? gps_justification { get; set; }
            public string? resolved_at { get; set; }
            public EmployeeDto employee { get; set; }
        }
        
        public class SyncRequest { public bool whatsapp_sync { get; set; } }
        public class ResolveRequest { public string action { get; set; } }

        [HttpGet("attendance")]
        public async Task<IActionResult> GetAttendance([FromQuery] string date)
        {
            try
            {
                var queryDate = string.IsNullOrEmpty(date) ? DateTime.Now.Date : DateTime.Parse(date).Date;
                var sqlDate = queryDate.ToString("yyyy-MM-dd");

                var sql = @$"
                    SELECT 
                        CAST(ad.id_registro AS NVARCHAR(50)) as id,
                        ad.id_colaborador as employee_id,
                        CONVERT(varchar, ad.fecha_asistencia, 23) as date,
                        CONVERT(varchar, ad.hora_checkin, 126) as check_in_time,
                        ad.lat_checkin as location_lat,
                        ad.long_checkin as location_lng,
                        ad.location_address as location_address,
                        CASE WHEN ad.check_salud_apto = 1 THEN 'saludable' ELSE 'con_sintomas' END as health_status,
                        ad.estado_final as system_status,
                        ad.whatsapp_sync as whatsapp_sync,
                        CONVERT(varchar, ad.sync_date, 126) as sync_date,
                        ad.alert_status as alert_status,
                        ad.justificacion_geo as gps_justification,
                        CONVERT(varchar, ad.resolved_at, 126) as resolved_at,
                        
                        -- Employee Info
                        c.nombre as emp_name,
                        c.rol as emp_role,
                        c.photo_url as emp_photo,
                        c.phone as emp_phone,
                        c.estado_operativo as emp_status,
                        CAST(c.active AS BIT) as emp_active

                    FROM Opera_Main.dbo.ASISTENCIA_DIARIA ad
                    LEFT JOIN Opera_Main.dbo.COLABORADORES c ON ad.id_colaborador = c.id
                    WHERE ad.fecha_asistencia = '{sqlDate}'
                    ORDER BY ad.hora_checkin ASC
                ";

                // We use dynamic mapping because EF Core SqlQueryRaw with nested objects is tricky.
                // Or we can fetch flat results and map manually.
                
                var rawData = await _context.Database.SqlQueryRaw<AttendanceFlatDto>(sql).ToListAsync();

                var records = rawData.Select(r => new AttendanceRecordDto
                {
                    id = r.id,
                    employee_id = r.employee_id,
                    date = r.date,
                    check_in_time = r.check_in_time,
                    location_lat = r.location_lat,
                    location_lng = r.location_lng,
                    location_address = r.location_address,
                    health_status = r.health_status,
                    system_status = r.system_status,
                    whatsapp_sync = r.whatsapp_sync,
                    sync_date = r.sync_date,
                    alert_status = r.alert_status,
                    gps_justification = r.gps_justification,
                    resolved_at = r.resolved_at,
                    employee = new EmployeeDto
                    {
                        id = r.employee_id,
                        name = r.emp_name,
                        role = r.emp_role,
                        photo_url = r.emp_photo,
                        phone = r.emp_phone,
                        estado_operativo = r.emp_status,
                        active = r.emp_active
                    }
                }).ToList();

                return Ok(records);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching attendance", error = ex.Message });
            }
        }

        [HttpGet("employees")]
        public async Task<IActionResult> GetEmployees()
        {
            try
            {
                var sql = "SELECT id, nombre as name, rol as role, photo_url, phone, estado_operativo, CAST(active AS BIT) as active FROM Opera_Main.dbo.COLABORADORES WHERE active = 1 ORDER BY nombre";
                var employees = await _context.Database.SqlQueryRaw<EmployeeDto>(sql).ToListAsync();
                return Ok(employees);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching employees", error = ex.Message });
            }
        }

        [HttpPut("attendance/{id}/sync")]
        public async Task<IActionResult> SyncWhatsapp(string id, [FromBody] SyncRequest req)
        {
            try
            {
                var syncDate = req.whatsapp_sync ? DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") : "NULL";
                var syncBit = req.whatsapp_sync ? 1 : 0;
                
                var sql = $"UPDATE Opera_Main.dbo.ASISTENCIA_DIARIA SET whatsapp_sync = {syncBit}, sync_date = {(req.whatsapp_sync ? $"'{syncDate}'" : "NULL")} WHERE id_registro = '{id}'";
                await _context.Database.ExecuteSqlRawAsync(sql);
                
                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error syncing", error = ex.Message });
            }
        }

        [HttpPut("attendance/{id}/resolve")]
        public async Task<IActionResult> ResolveAlert(string id, [FromBody] ResolveRequest req)
        {
            try
            {
                var action = req.action;
                var now = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
                string sql = "";

                if (action == "approve_exception")
                {
                    sql = $"UPDATE Opera_Main.dbo.ASISTENCIA_DIARIA SET estado_final = 'APROBADA_EXC', alert_status = 'exception_approved', resolved_at = '{now}' WHERE id_registro = '{id}'";
                }
                else if (action == "reject_exception")
                {
                    sql = $"UPDATE Opera_Main.dbo.ASISTENCIA_DIARIA SET estado_final = 'RECHAZADA', alert_status = 'exception_rejected', resolved_at = '{now}' WHERE id_registro = '{id}'";
                }
                else if (action == "accept")
                {
                    // Assuming accept clears the alert but keeps the valid status? Or sets to PRESENTE?
                    // server.ts implementation logic for 'accept' wasn't fully visible but usually means accepting the GPS variance
                    sql = $"UPDATE Opera_Main.dbo.ASISTENCIA_DIARIA SET alert_status = 'resolved', resolved_at = '{now}' WHERE id_registro = '{id}'";
                }
                else if (action == "reject")
                {
                    sql = $"UPDATE Opera_Main.dbo.ASISTENCIA_DIARIA SET estado_final = 'FALTA', alert_status = 'rejected', resolved_at = '{now}' WHERE id_registro = '{id}'";
                }

                if (!string.IsNullOrEmpty(sql))
                {
                    await _context.Database.ExecuteSqlRawAsync(sql);
                }

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error resolving alert", error = ex.Message });
            }
        }

        [HttpPost("attendance/seed")]
        public async Task<IActionResult> SeedAttendance()
        {
            try
            {
                var today = DateTime.Now.ToString("yyyy-MM-dd");
                
                // 1. Clean existing records for today
                await _context.Database.ExecuteSqlRawAsync($"DELETE FROM Opera_Main.dbo.ASISTENCIA_DIARIA WHERE fecha_asistencia = '{today}'");

                // 2. Get active employees
                var employees = await _context.Database.SqlQueryRaw<EmployeeDto>(
                    "SELECT id, nombre as name, rol as role, photo_url, phone, estado_operativo, CAST(active AS BIT) as active FROM Opera_Main.dbo.COLABORADORES WHERE active = 1"
                ).ToListAsync();

                if (!employees.Any()) return Ok(new { message = "No active employees found to seed." });

                var random = new Random();
                int countPresent = 0;
                int countLate = 0;

                foreach (var (emp, index) in employees.Select((e, i) => (e, i)))
                {
                    // Seed for first 20 employees only, or half of them
                    if (index >= 20) break;

                    string status;
                    string checkInTime;
                    
                    // First 60% Presente, Rest Tardanza
                    if (index % 3 != 0) // Simple 2/3 Presente logic
                    {
                        status = "presente";
                        // Random time between 07:00 and 07:59
                        int min = random.Next(0, 59);
                        checkInTime = $"{today} 07:{min:D2}:00";
                        countPresent++;
                    }
                    else
                    {
                        status = "tardanza";
                        // Random time between 08:15 and 09:30
                        int hour = random.Next(8, 9);
                        int min = random.Next(15, 59);
                        checkInTime = $"{today} {hour:D2}:{min:D2}:00";
                        countLate++;
                    }

                    var id = Guid.NewGuid().ToString();
                    var sql = $@"
                        INSERT INTO Opera_Main.dbo.ASISTENCIA_DIARIA (
                            id_registro, id_colaborador, fecha_asistencia, hora_checkin, 
                            lat_checkin, long_checkin, location_address, 
                            check_salud_apto, estado_final, whatsapp_sync
                        ) VALUES (
                            '{id}', {emp.id}, '{today}', '{checkInTime}', 
                            -12.046374, -77.042793, 'Sede Central - Seed Data', 
                            1, '{status}', 0
                        )";

                    await _context.Database.ExecuteSqlRawAsync(sql);
                }

                return Ok(new { 
                    message = "Attendance seeded successfully", 
                    date = today,
                    stats = new { present = countPresent, late = countLate, total = countPresent + countLate }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error seeding attendance", error = ex.Message });
            }
        }

        [HttpPost("attendance/update-locations")]
        public async Task<IActionResult> UpdateLocations()
        {
            try
            {
                var today = DateTime.Now.ToString("yyyy-MM-dd");
                var sourceDate = "2026-01-08";

                var sql = $@"
                    UPDATE target
                    SET 
                        target.lat_checkin = source.lat_checkin,
                        target.long_checkin = source.long_checkin,
                        target.location_address = source.location_address
                    FROM Opera_Main.dbo.ASISTENCIA_DIARIA target
                    INNER JOIN Opera_Main.dbo.ASISTENCIA_DIARIA source 
                        ON target.id_colaborador = source.id_colaborador
                    WHERE target.fecha_asistencia = '{today}' 
                      AND source.fecha_asistencia = '{sourceDate}'";

                int affected = await _context.Database.ExecuteSqlRawAsync(sql);

                return Ok(new { message = "Locations updated successfully", updated_count = affected });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating locations", error = ex.Message });
            }
        }

        // Flat DTO for SQL result mapping
        public class AttendanceFlatDto
        {
            public string id { get; set; }
            public int employee_id { get; set; }
            public string date { get; set; }
            public string? check_in_time { get; set; }
            public decimal? location_lat { get; set; }
            public decimal? location_lng { get; set; }
            public string? location_address { get; set; }
            public string health_status { get; set; }
            public string system_status { get; set; }
            public bool whatsapp_sync { get; set; }
            public string? sync_date { get; set; }
            public string? alert_status { get; set; }
            public string? gps_justification { get; set; }
            public string? resolved_at { get; set; }
            
            // Employee Cols
            public string? emp_name { get; set; }
            public string? emp_role { get; set; }
            public string? emp_photo { get; set; }
            public string? emp_phone { get; set; }
            public string? emp_status { get; set; }
            public bool emp_active { get; set; }
        }
    }
}
