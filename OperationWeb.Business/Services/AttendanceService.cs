using Microsoft.EntityFrameworkCore;
using OperationWeb.Business.Interfaces;
using OperationWeb.DataAccess;
using System;
using OperationWeb.Core.Entities;
using OperationWeb.Business.Interfaces.DTOs;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OperationWeb.Business.Services
{
    public class AttendanceService : IAttendanceService
    {
        private readonly OperaMainDbContext _context; // Use Legacy Context
        private readonly OperationWebDbContext _localContext; // Keep local just in case

        public AttendanceService(OperaMainDbContext context, OperationWebDbContext localContext)
        {
            _context = context;
            _localContext = localContext;
        }

        public async Task<(bool Success, string Message, string Status)> CheckInAsync(string dni, double lat, double lng, string address, bool isHealthOk)
        {
            try
            {
                var employee = await _context.Colaboradores
                    .Where(e => e.DNI == dni)
                    .OrderByDescending(e => e.Active == true)
                    .ThenBy(e => e.IdEmpleado)
                    .Select(e => new { e.IdEmpleado, e.IdZona })
                    .FirstOrDefaultAsync();
                
                if (employee == null) 
                    return (false, $"Colaborador con DNI {dni} no encontrado en Opera_Main.", null);
                
                var empId = employee.IdEmpleado;
                var limaZone = TimeZoneInfo.FindSystemTimeZoneById("SA Pacific Standard Time");
                var now = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, limaZone);
                var today = now.Date;

                await UpsertHealthStateAsync(empId, today, isHealthOk);

                if (!isHealthOk)
                {
                    // F2: Stop Work blocking path
                    return (false, "ERR_HEALTH_NOT_FIT: Usuario no apto para iniciar operaciones.", "blocked_health");
                }

                var hasExpiredSkill = await HasExpiredSkillAsync(empId, today);
                if (hasExpiredSkill)
                {
                    return (false, "ERR_SKILL_EXPIRED: Certificacion vencida para el colaborador.", "blocked_skill");
                }
                
                var exists = await _context.AsistenciasDiarias
                    .AnyAsync(a => a.IdColaborador == empId && a.FechaAsistencia == today);

                if (exists) 
                    return (false, "Ya marcaste asistencia el día de hoy.", null);

                var limitTime = today.AddHours(8); // 08:00 AM
                var status = now > limitTime ? "tardanza" : "presente";
                var alertStatus = await CalculateGeoAlertStatusAsync(employee.IdZona, lat, lng);

                var record = new AsistenciaDiaria
                {
                    IdRegistro = Guid.NewGuid().ToString(),
                    IdColaborador = empId,
                    FechaAsistencia = today,
                    HoraCheckIn = now,
                    LatCheckIn = (decimal)lat, 
                    LongCheckIn = (decimal)lng,
                    LocationAddress = !string.IsNullOrEmpty(address) ? address : "Ubicación Móvil",
                    CheckSaludApto = isHealthOk,
                    EstadoFinal = status,
                    WhatsappSync = false,
                    SyncDate = null,
                    AlertStatus = alertStatus
                };

                _context.Set<AsistenciaDiaria>().Add(record);
                await _context.SaveChangesAsync();

                return (true, "Asistencia registrada correctamente", status);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error en CheckIn: {ex.Message}", ex);
            }
        }

        private async Task UpsertHealthStateAsync(int empId, DateTime today, bool isHealthOk)
        {
            var state = await _context.EstadosSalud
                .FirstOrDefaultAsync(s => s.IdColaborador == empId && s.Fecha == today);

            if (state == null)
            {
                _context.EstadosSalud.Add(new EstadoSalud
                {
                    IdColaborador = empId,
                    Fecha = today,
                    Apto = isHealthOk,
                    RespuestasJson = null
                });
            }
            else
            {
                state.Apto = isHealthOk;
            }

            await _context.SaveChangesAsync();
        }

        private async Task<string?> CalculateGeoAlertStatusAsync(int? idZona, double lat, double lng)
        {
            if (idZona == null) return null;

            var zona = await _context.ZonasTrabajo
                .AsNoTracking()
                .FirstOrDefaultAsync(z => z.IdZona == idZona.Value && z.Activo);

            if (zona == null) return null;

            var distanceMeters = HaversineMeters(
                lat,
                lng,
                (double)zona.LatitudCentro,
                (double)zona.LongitudCentro);

            return distanceMeters > zona.RadioMetros ? "pending" : null;
        }

        private async Task<bool> HasExpiredSkillAsync(int empId, DateTime today)
        {
            return await _context.CertificacionesPersonal
                .AsNoTracking()
                .Where(c => c.IdColaborador == empId)
                .AnyAsync(c =>
                    c.FechaVencimiento.Date < today ||
                    (c.EstadoVigencia != null && (
                        c.EstadoVigencia.ToLower() == "vencido" ||
                        c.EstadoVigencia.ToLower() == "expirado" ||
                        c.EstadoVigencia.ToLower() == "no_apto"
                    )));
        }

        private static double HaversineMeters(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371000; // meters
            var dLat = DegreesToRadians(lat2 - lat1);
            var dLon = DegreesToRadians(lon2 - lon1);
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(DegreesToRadians(lat1)) * Math.Cos(DegreesToRadians(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c;
        }

        private static double DegreesToRadians(double degrees) => degrees * Math.PI / 180.0;

        public async Task<bool> SyncWhatsappAsync(string id, bool sync, string? syncDate)
        {
            try
            {
                var record = await _context.AsistenciasDiarias.FirstOrDefaultAsync(a => a.IdRegistro == id);
                if (record == null) return false;

                record.WhatsappSync = sync;
                if (syncDate != null)
                {
                    if (DateTime.TryParse(syncDate, out DateTime parsedDate))
                        record.SyncDate = parsedDate;
                }
                else
                {
                    record.SyncDate = null;
                }

                await _context.SaveChangesAsync();
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
                var record = await _context.AsistenciasDiarias.FirstOrDefaultAsync(a => a.IdRegistro == id);
                if (record == null) return false;

                DateTime now = DateTime.Now;

                if (action == "approve_exception")
                {
                    record.EstadoFinal = "APROBADA_EXC";
                    record.AlertStatus = "exception_approved";
                    record.ResolvedAt = now;
                }
                else if (action == "reject_exception")
                {
                    record.EstadoFinal = "RECHAZADA";
                    record.AlertStatus = "exception_rejected";
                    record.ResolvedAt = now;
                }

                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<List<AttendanceRecordDto>> GetAttendanceAsync(string date)
        {
            DateTime targetDate = DateTime.Now.Date;
            if (string.IsNullOrEmpty(date)) 
            {
                var limaZone = TimeZoneInfo.FindSystemTimeZoneById("SA Pacific Standard Time");
                targetDate = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, limaZone).Date;
            }
            else if (date == "all") 
            {
                targetDate = DateTime.MinValue; // Placeholder
            }
            else if (!DateTime.TryParse(date, out targetDate))
                targetDate = DateTime.Now.Date; // Fallback
            else
                targetDate = targetDate.Date;

            List<AsistenciaDiaria> records;
            if (date == "all")
            {
                records = await _context.AsistenciasDiarias
                    .OrderByDescending(a => a.FechaAsistencia)
                    .ThenByDescending(a => a.HoraCheckIn)
                    .Take(50)
                    .ToListAsync();
            }
            else
            {
                records = await _context.AsistenciasDiarias
                    .Where(a => a.FechaAsistencia == targetDate)
                    .ToListAsync();
            }

            var employees = await _context.Colaboradores.ToListAsync();
            var empDict = employees.ToDictionary(e => e.Id, e => e);

            var result = records.Select(r => {
                empDict.TryGetValue(r.IdColaborador, out var emp);
                return new AttendanceRecordDto
                {
                    id = r.IdRegistro,
                    employee_id = r.IdColaborador,
                    employee = emp != null ? new EmployeeDto { id = emp.Id, name = emp.Nombre, role = emp.Rol } : null,
                    date = r.FechaAsistencia.ToString("yyyy-MM-dd"),
                    check_in_time = r.HoraCheckIn?.ToString("yyyy-MM-ddTHH:mm:ss"),
                    location_lat = r.LatCheckIn,
                    location_lng = r.LongCheckIn,
                    location_address = r.LocationAddress,
                    system_status = r.EstadoFinal,
                    whatsapp_sync = r.WhatsappSync,
                    sync_date = r.SyncDate?.ToString("yyyy-MM-dd HH:mm:ss"),
                    alert_status = r.AlertStatus,
                    gps_justification = r.JustificacionGeo,
                    resolved_at = r.ResolvedAt?.ToString("yyyy-MM-dd HH:mm:ss")
                };
            }).ToList();

            return result;
        }

        public async Task<(bool Success, string Message)> SeedAttendanceAsync()
        {
            try
            {
                var limaZone = TimeZoneInfo.FindSystemTimeZoneById("SA Pacific Standard Time");
                var today = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, limaZone).Date;
                
                var exisiting = await _context.AsistenciasDiarias.Where(a => a.FechaAsistencia == today).ToListAsync();
                _context.AsistenciasDiarias.RemoveRange(exisiting);
                await _context.SaveChangesAsync();

                var employees = await _context.Colaboradores.Where(e => e.Active == true).Take(20).ToListAsync();

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

                foreach (var emp in employees)
                {
                    string status = random.Next(0, 5) == 0 ? "tardanza" : "presente";
                    var checkInTime = today.AddHours(7).AddMinutes(random.Next(0, 120));

                    var loc = locations[random.Next(locations.Count)];
                    
                    var record = new AsistenciaDiaria
                    {
                        IdRegistro = Guid.NewGuid().ToString(),
                        IdColaborador = emp.Id,
                        FechaAsistencia = today,
                        HoraCheckIn = checkInTime,
                        LatCheckIn = (decimal)loc.Lat,
                        LongCheckIn = (decimal)loc.Lng,
                        LocationAddress = loc.Address,
                        CheckSaludApto = true,
                        EstadoFinal = status,
                        WhatsappSync = false,
                        AlertStatus = random.Next(0, 10) == 0 ? "pending" : null
                    };
                    
                    _context.AsistenciasDiarias.Add(record);
                }

                await _context.SaveChangesAsync();
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
                var records = await _context.AsistenciasDiarias.Where(a => string.IsNullOrEmpty(a.LocationAddress)).ToListAsync();
                foreach (var r in records) r.LocationAddress = "Ubicación Geocodificada";
                await _context.SaveChangesAsync();
                return (true, "Addresses fixed", records.Count);
            }
            catch (Exception ex)
            {
                return (false, ex.Message, 0);
            }
        }
    }
}
