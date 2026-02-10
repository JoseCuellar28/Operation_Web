using Microsoft.AspNetCore.Mvc;
using OperationWeb.Business.Interfaces;
using OperationWeb.Business.Interfaces.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

// NOTE: Cleaned Controller. No DbContext dependency.
namespace OperationWeb.API.Controllers
{
    [Route("api/v1")]
    [ApiController]
    public class AttendanceController : ControllerBase
    {
        private readonly IAttendanceService _attendanceService;
        private readonly IEmpleadoService _empleadoService;

        public AttendanceController(IAttendanceService attendanceService, IEmpleadoService empleadoService)
        {
            _attendanceService = attendanceService;
            _empleadoService = empleadoService;
        }

        // DTOs for Requests
        public class CheckInRequest
        {
            [System.Text.Json.Serialization.JsonPropertyName("latitude")]
            public double Latitude { get; set; }
            
            [System.Text.Json.Serialization.JsonPropertyName("longitude")]
            public double Longitude { get; set; }
            
            [System.Text.Json.Serialization.JsonPropertyName("health_status")]
            public string? HealthStatus { get; set; }

            [System.Text.Json.Serialization.JsonPropertyName("address")]
            public string? Address { get; set; }
        }

        public class SyncRequest { public bool whatsapp_sync { get; set; } }
        public class ResolveRequest { public string action { get; set; } }

        [HttpGet("attendance")]
        public async Task<IActionResult> GetAttendance([FromQuery] string date)
        {
            var records = await _attendanceService.GetAttendanceAsync(date);
            return Ok(records);
        }

        [HttpGet("employees")]
        public async Task<IActionResult> GetEmployees()
        {
            var employees = await _empleadoService.GetAllEmpleadosAsync();
            return Ok(employees);
        }

        // [HttpGet("employees")] moved to EmpleadosController? 
        // Logic kept here to avoid breaking frontend if path is specific?
        // But Controller name is Attendance. 
        // Keeping it removed unless specifically asked, as EmpleadosController handles employees.
        // Wait, original controller HAD [HttpGet("employees")]. I should probably keep it calling EmpleadosService?
        // Or just redirect?
        // For now, I will assume EmpleadosController covers /employees via its own Route definition, 
        // BUT EmpleadosController has Route("api/[controller]") which is /api/Empleados.
        // The contract says /api/v1/employees.
        // I should probably add a wrapper here calling IEmpleadoService if I had access, or just leave it out 
        // and tell User to use the other controller?
        // The user prompt said: "Debes respetar el JSON de respuesta definido en docs/ para /api/v1/attendance/checkin y /api/v1/employees."
        // So I MUST handle /api/v1/employees.
        // Since I don't want to inject DbContext, and I don't have IEmpleadoService injected here yet, I can add it.
        // I'll add IEmpleadoService injection.

        [HttpPost("attendance/checkin")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> CheckIn([FromBody] CheckInRequest req)
        {
            var dni = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value 
                      ?? User.FindFirst("sub")?.Value 
                      ?? User.Identity?.Name;

            if (string.IsNullOrEmpty(dni)) return Unauthorized("Usuario no identificado");

            var result = await _attendanceService.CheckInAsync(dni, req.Latitude, req.Longitude, req.Address, req.HealthStatus == "saludable");

            if (!result.Success)
            {
                if (result.Message.Contains("Ya marcaste")) return BadRequest(result.Message);
                if (result.Message.Contains("no encontrado")) return NotFound(result.Message);
                return StatusCode(500, new { message = "Error interno", detail = result.Message });
            }

            return Ok(new { message = result.Message, status = result.Status });
        }

        [HttpPut("attendance/{id}/sync")]
        public async Task<IActionResult> SyncWhatsapp(string id, [FromBody] SyncRequest req)
        {
            var success = await _attendanceService.SyncWhatsappAsync(id, req.whatsapp_sync, req.whatsapp_sync ? DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") : null);
            return success ? Ok(new { success = true }) : StatusCode(500, new { message = "Error syncing" });
        }

        [HttpPut("attendance/{id}/resolve")]
        public async Task<IActionResult> ResolveAlert(string id, [FromBody] ResolveRequest req)
        {
            var success = await _attendanceService.ResolveAlertAsync(id, req.action);
            return success ? Ok(new { success = true }) : StatusCode(500, new { message = "Error resolving" });
        }

        [HttpPost("attendance/seed")]
        public async Task<IActionResult> SeedAttendance()
        {
            var result = await _attendanceService.SeedAttendanceAsync();
            return result.Success ? Ok(new { message = result.Message }) : StatusCode(500, new { message = result.Message });
            
        }

        [HttpPost("attendance/fix-addresses")]
        public async Task<IActionResult> FixAddresses()
        {
            var result = await _attendanceService.FixAddressesAsync();
             return result.Success ? Ok(new { message = result.Message, count = result.Count }) : StatusCode(500, new { message = result.Message });
        }
    }
}
