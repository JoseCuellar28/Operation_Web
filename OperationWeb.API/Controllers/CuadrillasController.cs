using Microsoft.AspNetCore.Mvc;
using OperationWeb.Business.Interfaces;
using OperationWeb.DataAccess.Entities;

namespace OperationWeb.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CuadrillasController : ControllerBase
    {
        private readonly ICuadrillaService _cuadrillaService;
        private readonly ILogger<CuadrillasController> _logger;

        public CuadrillasController(ICuadrillaService cuadrillaService, ILogger<CuadrillasController> logger)
        {
            _cuadrillaService = cuadrillaService;
            _logger = logger;
        }

        /// <summary>
        /// Obtiene todas las cuadrillas
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Cuadrilla>>> GetCuadrillas()
        {
            try
            {
                var cuadrillas = await _cuadrillaService.GetAllCuadrillasAsync();
                return Ok(cuadrillas);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener las cuadrillas");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Obtiene una cuadrilla por ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<Cuadrilla>> GetCuadrilla(int id)
        {
            try
            {
                var cuadrilla = await _cuadrillaService.GetCuadrillaByIdAsync(id);
                if (cuadrilla == null)
                    return NotFound($"Cuadrilla con ID {id} no encontrada");

                return Ok(cuadrilla);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener la cuadrilla {Id}", id);
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Obtiene una cuadrilla con su personal asignado
        /// </summary>
        [HttpGet("{id}/personal")]
        public async Task<ActionResult<Cuadrilla>> GetCuadrillaWithPersonal(int id)
        {
            try
            {
                var cuadrilla = await _cuadrillaService.GetCuadrillaWithPersonalAsync(id);
                if (cuadrilla == null)
                    return NotFound($"Cuadrilla con ID {id} no encontrada");

                return Ok(cuadrilla);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener la cuadrilla {Id} con personal", id);
                return StatusCode(500, "Error interno del servidor");
            }
        }

        // ... (GetCuadrillasByEstado, CreateCuadrilla, UpdateCuadrilla, DeleteCuadrilla remain same)

        /// <summary>
        /// Asigna personal a una cuadrilla
        /// </summary>
        [HttpPost("{cuadrillaId}/personal/{personalDNI}")]
        public async Task<ActionResult> AsignarPersonal(int cuadrillaId, string personalDNI, [FromBody] string? rol = null)
        {
            try
            {
                var resultado = await _cuadrillaService.AsignarPersonalAsync(cuadrillaId, personalDNI, rol);
                if (!resultado)
                    return BadRequest("No se pudo asignar el personal. Verifique que ambos existan y haya capacidad disponible.");

                return Ok("Personal asignado exitosamente");
            }
            catch (Exception ex)
            {
                var safeDNI = personalDNI.Replace(Environment.NewLine, "").Replace("\n", "").Replace("\r", "");
                _logger.LogError(ex, "Error al asignar personal {PersonalDNI} a cuadrilla {CuadrillaId}", safeDNI, cuadrillaId);
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Desasigna personal de una cuadrilla
        /// </summary>
        [HttpDelete("{cuadrillaId}/personal/{personalDNI}")]
        public async Task<ActionResult> DesasignarPersonal(int cuadrillaId, string personalDNI)
        {
            try
            {
                var resultado = await _cuadrillaService.DesasignarPersonalAsync(cuadrillaId, personalDNI);
                if (!resultado)
                    return NotFound("No se encontró la asignación especificada");

                return Ok("Personal desasignado exitosamente");
            }
            catch (Exception ex)
            {
                var safeDNI = personalDNI.Replace(Environment.NewLine, "").Replace("\n", "").Replace("\r", "");
                _logger.LogError(ex, "Error al desasignar personal {PersonalDNI} de cuadrilla {CuadrillaId}", safeDNI, cuadrillaId);
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Obtiene la capacidad disponible de una cuadrilla
        /// </summary>
        [HttpGet("{id}/capacidad-disponible")]
        public async Task<ActionResult<int>> GetCapacidadDisponible(int id)
        {
            try
            {
                var capacidad = await _cuadrillaService.GetCapacidadDisponibleAsync(id);
                return Ok(capacidad);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener capacidad disponible de cuadrilla {Id}", id);
                return StatusCode(500, "Error interno del servidor");
            }
        }
    }
}