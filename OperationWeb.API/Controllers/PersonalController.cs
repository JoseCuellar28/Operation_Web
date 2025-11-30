using Microsoft.AspNetCore.Mvc;
using OperationWeb.Business.Interfaces;
using OperationWeb.DataAccess.Entities;
using OperationWeb.Business.DTOs;

namespace OperationWeb.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Microsoft.AspNetCore.Authorization.Authorize] // Comentado temporalmente para facilitar pruebas si es necesario, pero idealmente debería estar activo
    public class PersonalController : ControllerBase
    {
        private readonly IPersonalService _personalService;
        private readonly ILogger<PersonalController> _logger;

        public PersonalController(IPersonalService personalService, ILogger<PersonalController> logger)
        {
            _personalService = personalService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PersonalWithUserStatusDto>>> GetAll()
        {
            try
            {
                var personal = await _personalService.GetAllWithUserStatusAsync();
                return Ok(personal);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener personal");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpPut("{dni}/terminate")]
        public async Task<ActionResult> Terminate(string dni)
        {
            try
            {
                var result = await _personalService.TerminateAsync(dni);
                if (!result) return NotFound($"Personal con DNI {dni} no encontrado");
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al cesar personal");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpGet("{dni}")]
        public async Task<ActionResult<Personal>> GetByDni(string dni)
        {
            try
            {
                var personal = await _personalService.GetByDniAsync(dni);
                if (personal == null)
                    return NotFound($"Personal con DNI {dni} no encontrado");

                return Ok(personal);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener personal por DNI");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Personal>> Create([FromBody] Personal personal)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var nuevo = await _personalService.CreateAsync(personal);
                return CreatedAtAction(nameof(GetByDni), new { dni = nuevo.DNI }, nuevo);
            }
            catch (ArgumentException ex)
            {
                return BadRequest("Error al procesar la solicitud.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear personal");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpPut("{dni}")]
        public async Task<ActionResult<Personal>> Update(string dni, [FromBody] Personal personal)
        {
            try
            {
                if (dni != personal.DNI)
                    return BadRequest("El DNI no coincide");

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var actualizado = await _personalService.UpdateAsync(personal);
                return Ok(actualizado);
            }
            catch (ArgumentException ex)
            {
                return BadRequest("Error al procesar la solicitud.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar personal");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpDelete("{dni}")]
        public async Task<ActionResult> Delete(string dni)
        {
            try
            {
                var resultado = await _personalService.DeleteAsync(dni);
                if (!resultado)
                    return NotFound($"Personal con DNI {dni} no encontrado");

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar personal");
                return StatusCode(500, "Error interno del servidor");
            }
        }
    }
}
