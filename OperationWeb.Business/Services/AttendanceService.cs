using Microsoft.EntityFrameworkCore;
using OperationWeb.Business.Interfaces;
using OperationWeb.DataAccess;
using System;
using Microsoft.EntityFrameworkCore;
using OperationWeb.Business.Interfaces;
using OperationWeb.DataAccess;
using OperationWeb.Core.Entities;
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
                // 1. Find Employee ID by DNI using LINQ
                var employee = await _context.Set<Empleado>()
                    .Where(e => e.DNI == dni)
                    .Select(e => new { e.IdEmpleado })
                    .FirstOrDefaultAsync();
                
                if (employee == null) 
                    return (false, $"Colaborador con DNI {dni} no encontrado en sistema Operativo.", null);
                
                var empId = employee.IdEmpleado;
                var today = DateTime.Now.Date;
                var now = DateTime.Now;
                
                // 2. Check if already checked in
                var exists = await _context.Set<AsistenciaDiaria>()
                    .AnyAsync(a => a.IdColaborador == empId && a.FechaAsistencia == today);

                if (exists) 
                    return (false, "Ya marcaste asistencia el día de hoy.", null);

                // 3. Determine Status (Simple Rule: Late after 08:00 AM)
                var limitTime = today.AddHours(8); // 08:00 AM of today
                var status = now > limitTime ? "tardanza" : "presente";

                // 4. Insert using Entity
                var record = new AsistenciaDiaria
                {
                    IdRegistro = Guid.NewGuid().ToString(),
                    IdColaborador = empId,
                    FechaAsistencia = today,
                    HoraCheckIn = now,
                    LatCheckIn = (decimal)lat, 
                    LongCheckIn = (decimal)lng,
                    LocationAddress = !string.IsNullOrEmpty(address) ? address : "Ubicación Móvil",
                    CheckSaludApto = isHealthOk ? 1 : 0, // Entity uses int?
                    EstadoFinal = status,
                    WhatsappSync = false,
                    SyncDate = null,
                    AlertStatus = null
                };

                _context.Set<AsistenciaDiaria>().Add(record);
                await _context.SaveChangesAsync();

                return (true, "Asistencia registrada correctamente", status);
            }
            catch (Exception ex)
            {
                // Log exception here if Logger was injected
                // throw new Exception($"Error en CheckIn: {ex.Message}", ex); 
                // Better to rethrow or return error tuple? Keeping exception for now to match interface contract generic-ness or Controller handling
                throw new Exception($"Error en CheckIn: {ex.Message}", ex);
            }
        }

        // AttendanceFlatDto removed as it is no longer needed with EF Core Entities

        public async Task<List<AttendanceRecordDto>> GetAttendanceAsync(string date)
        {
            var queryDate = string.IsNullOrEmpty(date) ? DateTime.Now.Date : DateTime.Parse(date).Date;

            // LINQ Join equivalent
            // Assuming we have Navigation Properties? 
            // If not, we do manual join. User said "Empleado.cs refactorizado... AsistenciaDiaria.cs nueva entidad".
            // Typically navigation properties like `AsistenciaDiaria.Colaborador` might exist if properly mapped.
            // But to be safe (and strict per user request "cambia SqlQueryRaw por consultas EF Core"), I will use Join or Nav Prop.
            
            // Let's try explicit Join for safety if Nav Prop names are unknown.
            
            var query = from ad in _context.Set<AsistenciaDiaria>()
                        join c in _context.Set<Empleado>() on ad.IdColaborador equals c.IdEmpleado into empGroup
                        from emp in empGroup.DefaultIfEmpty() // Left Join
                        where ad.FechaAsistencia == queryDate
                        orderby ad.HoraCheckIn
                        select new { ad, emp };

            var results = await query.ToListAsync();

            return results.Select(x => new AttendanceRecordDto
            {
                id = x.ad.IdRegistro,
                employee_id = x.ad.IdColaborador,
                date = x.ad.FechaAsistencia.ToString("yyyy-MM-dd"), 
                check_in_time = x.ad.HoraCheckIn?.ToString("yyyy-MM-ddTHH:mm:ss"), // Nullable DateTime
                location_lat = x.ad.LatCheckIn,
                location_lng = x.ad.LongCheckIn,
                location_address = x.ad.LocationAddress,
                health_status = (x.ad.CheckSaludApto == 1) ? "saludable" : "con_sintomas", // int? check
                
                system_status = x.ad.EstadoFinal,
                whatsapp_sync = x.ad.WhatsappSync,
                sync_date = x.ad.SyncDate?.ToString("yyyy-MM-ddTHH:mm:ss"),
                alert_status = x.ad.AlertStatus,
                gps_justification = x.ad.JustificacionGeo,
                resolved_at = x.ad.ResolvedAt?.ToString("yyyy-MM-ddTHH:mm:ss"),
                
                employee = x.emp != null ? new EmployeeDto
                {
                   id = x.emp.IdEmpleado,
                   name = x.emp.Nombre,
                   role = x.emp.Rol,
                   photo_url = x.emp.PhotoUrl,
                   phone = x.emp.Telefono, // Phone prop name in Entity map
                   estado_operativo = x.emp.EstadoOperativo,
                   active = x.emp.Active == true // Nullable bool check
                } : null
            }).ToList();
        }
        public async Task<bool> SyncWhatsappAsync(string id, bool sync, string? syncDate)
        {
            try
            {
                var record = await _context.Set<AsistenciaDiaria>().FirstOrDefaultAsync(a => a.IdRegistro == id);
                if (record == null) return false;

                record.WhatsappSync = sync;
                record.SyncDate = sync ? (string.IsNullOrEmpty(syncDate) ? DateTime.Now : DateTime.Parse(syncDate)) : null;

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
                var record = await _context.Set<AsistenciaDiaria>().FirstOrDefaultAsync(a => a.IdRegistro == id);
                if (record == null) return false;

                var now = DateTime.Now;

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
                else if (action == "accept")
                {
                    record.AlertStatus = "resolved";
                    record.ResolvedAt = now;
                }
                else if (action == "reject")
                {
                    record.EstadoFinal = "FALTA";
                    record.AlertStatus = "rejected";
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

        public async Task<(bool Success, string Message)> SeedAttendanceAsync()
        {
             try
            {
                var today = DateTime.Now.Date;
                
                // 1. Clean existing records for today (EF Core Bulk Delete or Iterate)
                // For simplicity and to stick to LINQ:
                var exisiting = await _context.Set<AsistenciaDiaria>().Where(a => a.FechaAsistencia == today).ToListAsync();
                _context.Set<AsistenciaDiaria>().RemoveRange(exisiting);
                await _context.SaveChangesAsync();

                // 2. Get active employees
                var employees = await _context.Set<Empleado>().Where(e => e.Active == true).ToListAsync();

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
                    DateTime checkInTime;
                    
                    if (index % 3 != 0) 
                    {
                        status = "presente";
                        int min = random.Next(0, 59);
                        checkInTime = today.AddHours(7).AddMinutes(min); // 07:MM
                    }
                    else
                    {
                        status = "tardanza";
                        int hour = random.Next(8, 9);
                        int min = random.Next(15, 59);
                        checkInTime = today.AddHours(hour).AddMinutes(min); // 08:MM or 09:MM
                    }

                    var loc = locations[random.Next(locations.Count)];
                    var id = Guid.NewGuid().ToString();
                    
                    var record = new AsistenciaDiaria
                    {
                        IdRegistro = id,
                        IdColaborador = emp.IdEmpleado,
                        FechaAsistencia = today,
                        HoraCheckIn = checkInTime,
                        LatCheckIn = (decimal)loc.Lat,
                        LongCheckIn = (decimal)loc.Lng,
                        LocationAddress = loc.Address,
                        CheckSaludApto = 1, // int? 1=true
                        EstadoFinal = status,
                        WhatsappSync = false
                    };
                    
                    _context.Set<AsistenciaDiaria>().Add(record);
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
                var today = DateTime.Now.Date;
                var records = await _context.Set<AsistenciaDiaria>().Where(a => a.FechaAsistencia == today).ToListAsync();

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

                foreach (var record in records)
                {
                    var loc = locations[random.Next(locations.Count)];
                    record.LatCheckIn = (decimal)loc.Lat;
                    record.LongCheckIn = (decimal)loc.Lng;
                    record.LocationAddress = loc.Address;
                    updated++;
                }

                await _context.SaveChangesAsync();

                return (true, "Addresses fixed", updated);
            }
            catch (Exception ex)
            {
                return (false, ex.Message, 0);
            }
        }
    }
}
