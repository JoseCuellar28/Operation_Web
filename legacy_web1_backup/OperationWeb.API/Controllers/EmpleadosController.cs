using Microsoft.AspNetCore.Mvc;
using OperationWeb.Business.Services;
using OperationWeb.Business.Interfaces;
using OperationWeb.DataAccess.Entities;

namespace OperationWeb.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public class EmpleadosController : ControllerBase
    {
        private readonly IEmpleadoService _empleadoService;
        private readonly ILogger<EmpleadosController> _logger;

        public EmpleadosController(IEmpleadoService empleadoService, ILogger<EmpleadosController> logger)
        {
            _empleadoService = empleadoService;
            _logger = logger;
        }

        /// <summary>
        /// Obtiene todos los empleados
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Empleado>>> GetEmpleados()
        {
            try
            {
                var empleados = await _empleadoService.GetAllEmpleadosAsync();
                return Ok(empleados);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener los empleados");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Obtiene empleados activos
        /// </summary>
        [HttpGet("activos")]
        public async Task<ActionResult<IEnumerable<Empleado>>> GetEmpleadosActivos()
        {
            try
            {
                var empleados = await _empleadoService.GetEmpleadosActivosAsync();
                return Ok(empleados);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener los empleados activos");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Obtiene empleados por empresa
        /// </summary>
        [HttpGet("empresa/{idEmpresa}")]
        public async Task<ActionResult<IEnumerable<Empleado>>> GetEmpleadosByEmpresa(int idEmpresa)
        {
            try
            {
                var empleados = await _empleadoService.GetEmpleadosByEmpresaAsync(idEmpresa);
                return Ok(empleados);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener los empleados por empresa");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Obtiene un empleado por ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<Empleado>> GetEmpleado(int id)
        {
            try
            {
                var empleado = await _empleadoService.GetEmpleadoByIdAsync(id);
                if (empleado == null)
                    return NotFound($"Empleado con ID {id} no encontrado");

                return Ok(empleado);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener el empleado");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Crea un nuevo empleado
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<Empleado>> CreateEmpleado([FromBody] Empleado empleado)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var nuevoEmpleado = await _empleadoService.CreateEmpleadoAsync(empleado);
                return CreatedAtAction(nameof(GetEmpleado), new { id = nuevoEmpleado.IdEmpleado }, nuevoEmpleado);
            }
            catch (ArgumentException)
            {
                return BadRequest("Error al procesar la solicitud.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear el empleado");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Actualiza un empleado existente
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<Empleado>> UpdateEmpleado(int id, [FromBody] Empleado empleado)
        {
            try
            {
                if (id != empleado.IdEmpleado)
                    return BadRequest("El ID del empleado no coincide");

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var empleadoActualizado = await _empleadoService.UpdateEmpleadoAsync(empleado);
                return Ok(empleadoActualizado);
            }
            catch (ArgumentException)
            {
                return BadRequest("Error al procesar la solicitud.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar el empleado");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Elimina un empleado (soft delete)
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteEmpleado(int id)
        {
            try
            {
                var resultado = await _empleadoService.DeleteEmpleadoAsync(id);
                if (!resultado)
                    return NotFound($"Empleado con ID {id} no encontrado");

                return NoContent();
            }
            catch (ArgumentException)
            {
                return BadRequest("Error al procesar la solicitud.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar el empleado");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Valida si un documento es único
        /// </summary>
        [HttpGet("validate-documento/{numeroDocumento}")]
        public async Task<ActionResult<bool>> ValidateUniqueDocumento(string numeroDocumento, [FromQuery] int? excludeId = null)
        {
            try
            {
                var isUnique = await _empleadoService.ValidateUniqueDocumentoAsync(numeroDocumento, excludeId);
                return Ok(isUnique);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al validar documento único");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Valida si un email es único
        /// </summary>
        [HttpGet("validate-email/{email}")]
        public async Task<ActionResult<bool>> ValidateUniqueEmail(string email, [FromQuery] int? excludeId = null)
        {
            try
            {
                var isUnique = await _empleadoService.ValidateUniqueEmailAsync(email, excludeId);
                return Ok(isUnique);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al validar email único");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Valida si un código de empleado es único
        /// </summary>
        [HttpGet("validate-codigo/{codigoEmpleado}")]
        public async Task<ActionResult<bool>> ValidateUniqueCodigoEmpleado(string codigoEmpleado, [FromQuery] int? excludeId = null)
        {
            try
            {
                var isUnique = await _empleadoService.ValidateUniqueCodigoEmpleadoAsync(codigoEmpleado, excludeId);
                return Ok(isUnique);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al validar código de empleado único");
                return StatusCode(500, "Error interno del servidor");
            }
        }
    }
}