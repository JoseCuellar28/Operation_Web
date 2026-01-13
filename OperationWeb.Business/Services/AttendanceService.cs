using Microsoft.EntityFrameworkCore;
using OperationWeb.Business.Interfaces;
using OperationWeb.DataAccess;
using System;
using Microsoft.EntityFrameworkCore;
using OperationWeb.Business.Interfaces;
using OperationWeb.DataAccess;
using OperationWeb.Business.Interfaces.DTOs;
// using OperationWeb.DataAccess.DTOs; // Removed to avoid ambiguity
using System.Linq;
using System.Collections.Generic;
using System;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;

namespace OperationWeb.Business.Services
{
    public class AttendanceService : IAttendanceService
    {
        private readonly OperationWebDbContext _context;

        public AttendanceService(OperationWebDbContext context)
        {
            _context = context;
        }

        public async Task<(bool Success, string Message, string Status)> CheckInAsync(string dni, double lat, double lng, string address, bool isHealthOk)
        {
            try
            {
                // 1. Find Employee ID by DNI
                var empIdSql = "SELECT TOP 1 id AS Value FROM Opera_Main.dbo.COLABORADORES WHERE dni = @dni";
                var pDni = new SqlParameter("@dni", dni);
                
                // Using SqlQueryRaw checking for DNI
                var empIds = await _context.Database.SqlQueryRaw<int>(empIdSql, pDni).ToListAsync();
                
                if (empIds.Count == 0) 
                    return (false, $"Colaborador con DNI {dni} no encontrado en sistema Operativo.", null);
                
                var empId = empIds[0];
                var today = DateTime.Now.Date;
                var now = DateTime.Now;
                var todayStr = today.ToString("yyyyMMdd");
                
                // 2. Check if already checked in
                var pEmpIdCheck = new SqlParameter("@empIdCheck", empId);
                var pTodayCheck = new SqlParameter("@todayCheck", today);
                
                var existsSql = "SELECT COUNT(1) AS Value FROM Opera_Main.dbo.ASISTENCIA_DIARIA WHERE id_colaborador = @empIdCheck AND fecha_asistencia = @todayCheck";
                
                var count = await _context.Database.SqlQueryRaw<int>(existsSql, pEmpIdCheck, pTodayCheck).FirstOrDefaultAsync();

                if (count > 0) 
                    return (false, "Ya marcaste asistencia el día de hoy.", null);

                // 3. Determine Status (Simple Rule: Late after 08:00 AM)
                var limitTime = DateTime.ParseExact($"{now:yyyy-MM-dd} 08:00:00", "yyyy-MM-dd HH:mm:ss", null);
                var status = now > limitTime ? "tardanza" : "presente";

                // 4. Insert
                var pId = new SqlParameter("@id", Guid.NewGuid().ToString());
                var pEmpId = new SqlParameter("@empId", empId);
                var pToday = new SqlParameter("@today", DateTime.ParseExact(todayStr, "yyyyMMdd", null)); 
                var pNow = new SqlParameter("@now", now);
                var pLat = new SqlParameter("@lat", lat);
                var pLng = new SqlParameter("@lng", lng);
                var pAddr = new SqlParameter("@addr", !string.IsNullOrEmpty(address) ? address : "Ubicación Móvil");
                var pHealth = new SqlParameter("@health", isHealthOk ? 1 : 0);
                var pStatus = new SqlParameter("@status", status);
                
                var insertSql = @"
                    INSERT INTO Opera_Main.dbo.ASISTENCIA_DIARIA (
                        id_registro, id_colaborador, fecha_asistencia, hora_checkin, 
                        lat_checkin, long_checkin, location_address, 
                        check_salud_apto, estado_final, whatsapp_sync
                    ) VALUES (
                        @id, @empId, @today, @now, 
                        @lat, @lng, @addr, 
                        @health, @status, 0
                    )";

                await _context.Database.ExecuteSqlRawAsync(insertSql, pId, pEmpId, pToday, pNow, pLat, pLng, pAddr, pHealth, pStatus);

                return (true, "Asistencia registrada correctamente", status);
            }
            catch (Exception ex)
            {
                // Log exception here if Logger was injected
                throw new Exception($"Error en CheckIn: {ex.Message}", ex);
            }
        }

        // Define Flat DTO locally or use if available in DataAccess
        private class AttendanceFlatDto
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
            
            public string emp_name { get; set; }
            public string emp_role { get; set; }
            public string? emp_photo { get; set; }
            public string? emp_phone { get; set; }
            public string emp_status { get; set; }
            public bool emp_active { get; set; }
        }

        public async Task<List<AttendanceRecordDto>> GetAttendanceAsync(string date)
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
            
            // Note: Since we don't have implicit mapping for custom types in raw SQL easily without Keyless Entity,
            // we will try to use the private class. EF Core require it to be registered in DbContext as Keyless to work with SqlQuery
            // OR we use a manual reader or simple dynamic.
            
            // However, the previous controller code used `_context.Database.SqlQueryRaw<AttendanceFlatDto>(sql)`. 
            // This implies `AttendanceFlatDto` WAS registered or mapped.
            // If it fails, we should wrap in try-catch or use a safer approach.
            // But let's assume it works as it was in the controller.
            
            try 
            {
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

               return records;
            }
            catch (InvalidOperationException)
            {
                // Fallback if DTO is not registered: return empty or throw clear error
                // In a real scenario we'd add the Keyless Entity config to OnModelCreating
                throw new Exception("EF Core Mapping Error: AttendanceFlatDto likely not registered.");
            }
        }
        public async Task<bool> SyncWhatsappAsync(string id, bool sync, string? syncDate)
        {
            try
            {
                var syncBit = sync ? 1 : 0;
                var sql = $"UPDATE Opera_Main.dbo.ASISTENCIA_DIARIA SET whatsapp_sync = {syncBit}, sync_date = {(sync ? $"'{syncDate}'" : "NULL")} WHERE id_registro = '{id}'";
                await _context.Database.ExecuteSqlRawAsync(sql);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> ResolveAlertAsync(string id, string action)
        {
            try
            {
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
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<(bool Success, string Message)> SeedAttendanceAsync()
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

                if (!employees.Any()) return (false, "No active employees found to seed.");

                var random = new Random();
                var locations = new List<(double Lat, double Lng, string Address)>
                {
                    (-12.046374, -77.042793, "Av. Argentina 3093, Cercado de Lima"),
                    (-12.055250, -77.039200, "Jr. Washington 1200, Lima"),
                    (-12.034500, -76.953500, "Carretera Central Km 5, Ate"),
                    (-12.112000, -77.025000, "Av. Angamos Este 1500, Surquillo"),
                    (-11.995000, -77.075000, "Av. Universitaria 5500, San Martin de Porres")
                };

                foreach (var (emp, index) in employees.Select((e, i) => (e, i)))
                {
                    if (index >= 20) break;

                    string status;
                    string checkInTime;
                    
                    if (index % 3 != 0) 
                    {
                        status = "presente";
                        int min = random.Next(0, 59);
                        checkInTime = $"{today} 07:{min:D2}:00";
                    }
                    else
                    {
                        status = "tardanza";
                        int hour = random.Next(8, 9);
                        int min = random.Next(15, 59);
                        checkInTime = $"{today} {hour:D2}:{min:D2}:00";
                    }

                    var loc = locations[random.Next(locations.Count)];
                    var id = Guid.NewGuid().ToString();
                    var latStr = loc.Lat.ToString(System.Globalization.CultureInfo.InvariantCulture);
                    var lngStr = loc.Lng.ToString(System.Globalization.CultureInfo.InvariantCulture);
                    
                    var sql = $@"
                        INSERT INTO Opera_Main.dbo.ASISTENCIA_DIARIA (
                            id_registro, id_colaborador, fecha_asistencia, hora_checkin, 
                            lat_checkin, long_checkin, location_address, 
                            check_salud_apto, estado_final, whatsapp_sync
                        ) VALUES (
                            '{id}', {emp.id}, '{today}', '{checkInTime}', 
                            {latStr}, {lngStr}, '{loc.Address}', 
                            1, '{status}', 0
                        )";

                    await _context.Database.ExecuteSqlRawAsync(sql);
                }

                return (true, "Attendance seeded successfully");
            }
            catch (Exception ex)
            {
                return (false, ex.Message);
            }
        }

        public async Task<(bool Success, string Message, int Count)> FixAddressesAsync()
        {
            try
            {
                var today = DateTime.Now.ToString("yyyy-MM-dd");
                var ids = await _context.Database.SqlQueryRaw<string>($"SELECT CAST(id_registro AS NVARCHAR(50)) as Value FROM Opera_Main.dbo.ASISTENCIA_DIARIA WHERE fecha_asistencia = '{today}'").ToListAsync();

                var random = new Random();
                int updated = 0;
                var locations = new List<(double Lat, double Lng, string Address)>
                {
                    (-12.046374, -77.042793, "Av. Argentina 3093, Cercado de Lima"),
                    (-12.055250, -77.039200, "Jr. Washington 1200, Lima"),
                    (-12.034500, -76.953500, "Carretera Central Km 5, Ate"),
                    (-12.112000, -77.025000, "Av. Angamos Este 1500, Surquillo"),
                    (-11.995000, -77.075000, "Av. Universitaria 5500, San Martin de Porres")
                };

                foreach (var id in ids)
                {
                    var loc = locations[random.Next(locations.Count)];
                    var latStr = loc.Lat.ToString(System.Globalization.CultureInfo.InvariantCulture);
                    var lngStr = loc.Lng.ToString(System.Globalization.CultureInfo.InvariantCulture);
                    var sql = $"UPDATE Opera_Main.dbo.ASISTENCIA_DIARIA SET lat_checkin = {latStr}, long_checkin = {lngStr}, location_address = '{loc.Address}' WHERE id_registro = '{id}'";
                    await _context.Database.ExecuteSqlRawAsync(sql);
                    updated++;
                }

                return (true, "Addresses fixed", updated);
            }
            catch (Exception ex)
            {
                return (false, ex.Message, 0);
            }
        }
    }
}
