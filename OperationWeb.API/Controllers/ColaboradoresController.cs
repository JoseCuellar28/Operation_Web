using Microsoft.AspNetCore.Mvc;
using OperationWeb.Business.Interfaces;
using OperationWeb.DataAccess.Entities;

namespace OperationWeb.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ColaboradoresController : ControllerBase
    {
        private readonly IColaboradorService _colaboradorService;
        private readonly ILogger<ColaboradoresController> _logger;

        public ColaboradoresController(IColaboradorService colaboradorService, ILogger<ColaboradoresController> logger)
        {
            _colaboradorService = colaboradorService;
            _logger = logger;
        }

        /// <summary>
        /// Obtiene todos los colaboradores
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Colaborador>>> GetColaboradores()
        {
            try
            {
                var colaboradores = await _colaboradorService.GetAllColaboradoresAsync();
                return Ok(colaboradores);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener los colaboradores");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Obtiene un colaborador por ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<Colaborador>> GetColaborador(int id)
        {
            try
            {
                var colaborador = await _colaboradorService.GetColaboradorByIdAsync(id);
                if (colaborador == null)
                    return NotFound($"Colaborador con ID {id} no encontrado");

                return Ok(colaborador);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener el colaborador {Id}", id);
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Obtiene colaboradores por estado
        /// </summary>
        [HttpGet("estado/{estado}")]
        public async Task<ActionResult<IEnumerable<Colaborador>>> GetColaboradoresByEstado(string estado)
        {
            try
            {
                var colaboradores = await _colaboradorService.GetColaboradoresByEstadoAsync(estado);
                return Ok(colaboradores);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener colaboradores por estado {Estado}", estado);
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Obtiene colaboradores por cargo
        /// </summary>
        [HttpGet("cargo/{cargo}")]
        public async Task<ActionResult<IEnumerable<Colaborador>>> GetColaboradoresByCargo(string cargo)
        {
            try
            {
                var colaboradores = await _colaboradorService.GetColaboradoresByCargoAsync(cargo);
                return Ok(colaboradores);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener colaboradores por cargo {Cargo}", cargo);
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Obtiene colaboradores disponibles (no asignados a cuadrillas)
        /// </summary>
        [HttpGet("disponibles")]
        public async Task<ActionResult<IEnumerable<Colaborador>>> GetColaboradoresDisponibles()
        {
            try
            {
                var colaboradores = await _colaboradorService.GetColaboradoresDisponiblesAsync();
                return Ok(colaboradores);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener colaboradores disponibles");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Crea un nuevo colaborador
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<Colaborador>> CreateColaborador(Colaborador colaborador)
        {
            try
            {
                var nuevoColaborador = await _colaboradorService.CreateColaboradorAsync(colaborador);
                return CreatedAtAction(nameof(GetColaborador), new { id = nuevoColaborador.Id }, nuevoColaborador);
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
                _logger.LogError(ex, "Error al crear el colaborador");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Actualiza un colaborador existente
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<Colaborador>> UpdateColaborador(int id, Colaborador colaborador)
        {
            try
            {
                if (id != colaborador.Id)
                    return BadRequest("El ID de la URL no coincide con el ID del colaborador");

                var colaboradorActualizado = await _colaboradorService.UpdateColaboradorAsync(colaborador);
                return Ok(colaboradorActualizado);
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
                _logger.LogError(ex, "Error al actualizar el colaborador {Id}", id);
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Elimina un colaborador
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteColaborador(int id)
        {
            try
            {
                var resultado = await _colaboradorService.DeleteColaboradorAsync(id);
                if (!resultado)
                    return NotFound($"Colaborador con ID {id} no encontrado");

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar el colaborador {Id}", id);
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Obtiene las cuadrillas de un colaborador
        /// </summary>
        [HttpGet("{id}/cuadrillas")]
        public async Task<ActionResult<IEnumerable<Cuadrilla>>> GetCuadrillasByColaborador(int id)
        {
            try
            {
                var cuadrillas = await _colaboradorService.GetCuadrillasByColaboradorAsync(id);
                return Ok(cuadrillas);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener cuadrillas del colaborador {Id}", id);
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Valida si un documento es único
        /// </summary>
        [HttpGet("validar-documento/{documento}")]
        public async Task<ActionResult<bool>> ValidarDocumentoUnico(string documento, [FromQuery] int? colaboradorId = null)
        {
            try
            {
                var esUnico = await _colaboradorService.ValidarDocumentoUnicoAsync(documento, colaboradorId);
                return Ok(esUnico);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al validar documento {Documento}", documento);
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Valida si un email es único
        /// </summary>
        [HttpGet("validar-email/{email}")]
        public async Task<ActionResult<bool>> ValidarEmailUnico(string email, [FromQuery] int? colaboradorId = null)
        {
            try
            {
                var esUnico = await _colaboradorService.ValidarEmailUnicoAsync(email, colaboradorId);
                return Ok(esUnico);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al validar email {Email}", email);
                return StatusCode(500, "Error interno del servidor");
            }
        }
    }
}