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
        /// Obtiene una cuadrilla con sus colaboradores
        /// </summary>
        [HttpGet("{id}/colaboradores")]
        public async Task<ActionResult<Cuadrilla>> GetCuadrillaWithColaboradores(int id)
        {
            try
            {
                var cuadrilla = await _cuadrillaService.GetCuadrillaWithColaboradoresAsync(id);
                if (cuadrilla == null)
                    return NotFound($"Cuadrilla con ID {id} no encontrada");

                return Ok(cuadrilla);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener la cuadrilla {Id} con colaboradores", id);
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Obtiene cuadrillas por estado
        /// </summary>
        [HttpGet("estado/{estado}")]
        public async Task<ActionResult<IEnumerable<Cuadrilla>>> GetCuadrillasByEstado(string estado)
        {
            try
            {
                var cuadrillas = await _cuadrillaService.GetCuadrillasByEstadoAsync(estado);
                return Ok(cuadrillas);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener cuadrillas por estado {Estado}", estado);
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Crea una nueva cuadrilla
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<Cuadrilla>> CreateCuadrilla(Cuadrilla cuadrilla)
        {
            try
            {
                var nuevaCuadrilla = await _cuadrillaService.CreateCuadrillaAsync(cuadrilla);
                return CreatedAtAction(nameof(GetCuadrilla), new { id = nuevaCuadrilla.Id }, nuevaCuadrilla);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear la cuadrilla");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Actualiza una cuadrilla existente
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<Cuadrilla>> UpdateCuadrilla(int id, Cuadrilla cuadrilla)
        {
            try
            {
                if (id != cuadrilla.Id)
                    return BadRequest("El ID de la URL no coincide con el ID de la cuadrilla");

                var cuadrillaActualizada = await _cuadrillaService.UpdateCuadrillaAsync(cuadrilla);
                return Ok(cuadrillaActualizada);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar la cuadrilla {Id}", id);
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Elimina una cuadrilla
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteCuadrilla(int id)
        {
            try
            {
                var resultado = await _cuadrillaService.DeleteCuadrillaAsync(id);
                if (!resultado)
                    return NotFound($"Cuadrilla con ID {id} no encontrada");

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar la cuadrilla {Id}", id);
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Asigna un colaborador a una cuadrilla
        /// </summary>
        [HttpPost("{cuadrillaId}/colaboradores/{colaboradorId}")]
        public async Task<ActionResult> AsignarColaborador(int cuadrillaId, int colaboradorId, [FromBody] string? rol = null)
        {
            try
            {
                var resultado = await _cuadrillaService.AsignarColaboradorAsync(cuadrillaId, colaboradorId, rol);
                if (!resultado)
                    return BadRequest("No se pudo asignar el colaborador. Verifique que ambos existan, estén activos y haya capacidad disponible.");

                return Ok("Colaborador asignado exitosamente");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al asignar colaborador {ColaboradorId} a cuadrilla {CuadrillaId}", colaboradorId, cuadrillaId);
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Desasigna un colaborador de una cuadrilla
        /// </summary>
        [HttpDelete("{cuadrillaId}/colaboradores/{colaboradorId}")]
        public async Task<ActionResult> DesasignarColaborador(int cuadrillaId, int colaboradorId)
        {
            try
            {
                var resultado = await _cuadrillaService.DesasignarColaboradorAsync(cuadrillaId, colaboradorId);
                if (!resultado)
                    return NotFound("No se encontró la asignación especificada");

                return Ok("Colaborador desasignado exitosamente");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al desasignar colaborador {ColaboradorId} de cuadrilla {CuadrillaId}", colaboradorId, cuadrillaId);
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