using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OperationWeb.Business.Interfaces;
using OperationWeb.DataAccess.Entities;

namespace OperationWeb.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Secure by default
    public class ProyectosController : ControllerBase
    {
        private readonly IProyectoService _proyectoService;
        private readonly IUserContextService _userContext;

        public ProyectosController(IProyectoService proyectoService, IUserContextService userContext)
        {
            _proyectoService = proyectoService;
            _userContext = userContext;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Proyecto>>> GetProyectos()
        {
            var proyectos = await _proyectoService.GetAllProyectosAsync();

            // Apply Data Scoping
            var role = _userContext.GetUserRole();
            var level = _userContext.GetUserLevel();
            var division = _userContext.GetUserDivision();
            var area = _userContext.GetUserArea();
            
            // Get User DNI for manual assignment check (Assuming DNI is the username or stored in claims)
            // In AuthController we set ClaimTypes.NameIdentifier to DNI
            var userDni = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            // Admin sees everything
            if (string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase))
            {
                return Ok(proyectos);
            }

            // Filter Logic:
            // 1. Hierarchy Access (Division/Area)
            // 2. OR Manual Assignment (GerenteDni/JefeDni)
            
            var filteredProyectos = proyectos.Where(p => 
            {
                // Check Manual Assignment first (Overrides hierarchy)
                if (!string.IsNullOrEmpty(userDni) && (p.GerenteDni == userDni || p.JefeDni == userDni))
                {
                    return true;
                }

                // Check Hierarchy
                if (string.Equals(level, "Manager", StringComparison.OrdinalIgnoreCase))
                {
                    return !string.IsNullOrEmpty(division) && string.Equals(p.Division, division, StringComparison.OrdinalIgnoreCase);
                }
                
                if (string.Equals(level, "Coordinator", StringComparison.OrdinalIgnoreCase) || 
                    string.Equals(level, "Supervisor", StringComparison.OrdinalIgnoreCase))
                {
                    return !string.IsNullOrEmpty(area) && string.Equals(p.Nombre, area, StringComparison.OrdinalIgnoreCase);
                }

                return false; // No access otherwise
            }).ToList();

            return Ok(filteredProyectos);
        }

        [HttpPost("sync")]
        public async Task<IActionResult> SincronizarProyectos()
        {
            try
            {
                int nuevos = await _proyectoService.SincronizarProyectosDesdePersonalAsync();
                return Ok(new { message = $"Sincronización completada. {nuevos} nuevos proyectos creados.", nuevosProyectos = nuevos });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error durante la sincronización", error = ex.Message });
            }
        }

        [HttpPut("{id}/assign")]
        public async Task<IActionResult> AsignarLideres(int id, [FromBody] AssignmentDto assignment)
        {
            try
            {
                await _proyectoService.AsignarLideresAsync(id, assignment.GerenteDni, assignment.JefeDni);
                return Ok(new { message = "Líderes asignados correctamente." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al asignar líderes", error = ex.Message });
            }
        }

        public class AssignmentDto
        {
            public string? GerenteDni { get; set; }
            public string? JefeDni { get; set; }
        }
    }
}
