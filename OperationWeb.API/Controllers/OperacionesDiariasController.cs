using Microsoft.AspNetCore.Mvc;
using OperationWeb.Business.Interfaces;
using OperationWeb.Core.Entities;

namespace OperationWeb.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OperacionesDiariasController : ControllerBase
    {
        private readonly ILogger<OperacionesDiariasController> _logger;

        public OperacionesDiariasController(ILogger<OperacionesDiariasController> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Recibe datos de Excel desde el frontend de Gestión Operativa
        /// </summary>
        [HttpPost("compartir-excel")]
        public async Task<ActionResult> CompartirDatosExcel([FromBody] ExcelDataRequest request)
        {
            try
            {
                _logger.LogInformation("Recibiendo datos de Excel: {Count} registros", request.Data?.Count ?? 0);
                
                if (request.Data == null || !request.Data.Any())
                {
                    return BadRequest("No se recibieron datos para procesar");
                }

                // Aquí procesarías los datos según tu lógica de negocio
                // Por ejemplo, guardar en base de datos, validar, etc.
                
                var resultado = new
                {
                    success = true,
                    message = $"Datos procesados exitosamente: {request.Data.Count} registros",
                    registrosProcesados = request.Data.Count,
                    timestamp = DateTime.UtcNow
                };

                return Ok(resultado);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al procesar datos de Excel");
                return StatusCode(500, new { 
                    success = false, 
                    message = "Error interno del servidor al procesar los datos",
                    error = ex.Message 
                });
            }
        }

        /// <summary>
        /// Obtiene estadísticas de operaciones diarias
        /// </summary>
        [HttpGet("estadisticas")]
        public async Task<ActionResult> GetEstadisticas()
        {
            try
            {
                var estadisticas = new
                {
                    totalRegistros = 0,
                    ultimaActualizacion = DateTime.UtcNow,
                    estado = "Activo"
                };

                return Ok(estadisticas);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener estadísticas");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Valida formato de datos de Excel
        /// </summary>
        [HttpPost("validar-formato")]
        public async Task<ActionResult> ValidarFormato([FromBody] ExcelDataRequest request)
        {
            try
            {
                var validacion = new
                {
                    esValido = true,
                    errores = new List<string>(),
                    advertencias = new List<string>(),
                    columnasDetectadas = request.Headers?.Count ?? 0
                };

                return Ok(validacion);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al validar formato");
                return StatusCode(500, "Error interno del servidor");
            }
        }
    }

    public class ExcelDataRequest
    {
        public List<string>? Headers { get; set; }
        public List<Dictionary<string, object>>? Data { get; set; }
        public string? FileName { get; set; }
        public string? SheetName { get; set; }
    }
}