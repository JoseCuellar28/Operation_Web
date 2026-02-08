using Microsoft.AspNetCore.Mvc;
using OperationWeb.Business.Interfaces;
using OperationWeb.Core.Entities;
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
        private readonly IUserContextService _userContext;
        private readonly IWebHostEnvironment _env;

        public PersonalController(IPersonalService personalService, ILogger<PersonalController> logger, IUserContextService userContext, IWebHostEnvironment env)
        {
            _personalService = personalService;
            _logger = logger;
            _userContext = userContext;
            _env = env;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PersonalWithUserStatusDto>>> GetAll()
        {
            try
            {
                // Apply Data Scoping
                var role = _userContext.GetUserRole();
                var level = _userContext.GetUserLevel();
                var division = _userContext.GetUserDivision();
                var area = _userContext.GetUserArea();

                _logger.LogInformation($"[DEBUG] User Context - Role: '{role}', Level: '{level}', Division: '{division}', Area: '{area}'");
                // Fetch data first
                var personal = await _personalService.GetAllWithUserStatusAsync();

                _logger.LogInformation($"[DEBUG] User Context - Role: '{role}', Level: '{level}', Division: '{division}', Area: '{area}'");
                _logger.LogInformation($"[DEBUG] Total Personal records before filter: {personal.Count()}");

                // Admin sees everything
                if (string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase))
                {
                    _logger.LogInformation("[DEBUG] User is Admin. Returning all records.");
                    return Ok(personal);
                }

                // Hierarchy Filtering
                if (string.Equals(level, "Manager", StringComparison.OrdinalIgnoreCase))
                {
                    if (!string.IsNullOrEmpty(division))
                    {
                        personal = personal.Where(p => string.Equals(p.Division, division, StringComparison.OrdinalIgnoreCase));
                    }
                    else
                    {
                        _logger.LogWarning("[DEBUG] Manager has no Division. Returning empty.");
                        return Ok(new List<PersonalWithUserStatusDto>());
                    }
                }
                else if (string.Equals(level, "Coordinator", StringComparison.OrdinalIgnoreCase) || 
                         string.Equals(level, "Supervisor", StringComparison.OrdinalIgnoreCase))
                {
                    if (!string.IsNullOrEmpty(area))
                    {
                        personal = personal.Where(p => string.Equals(p.Area, area, StringComparison.OrdinalIgnoreCase));
                    }
                    else
                    {
                        _logger.LogWarning("[DEBUG] Coordinator/Supervisor has no Area. Returning empty.");
                        return Ok(new List<PersonalWithUserStatusDto>());
                    }
                }
                else
                {
                    _logger.LogWarning($"[DEBUG] Role '{role}' / Level '{level}' not authorized for full list. Returning empty.");
                    // Regular employees see nothing (or maybe their own record? For now nothing)
                    return Ok(new List<PersonalWithUserStatusDto>());
                }

                _logger.LogInformation($"[DEBUG] Returning {personal.Count()} records after filter.");
                return Ok(personal);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener personal");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpGet("metadata")]
        public async Task<ActionResult<PersonalMetadataDto>> GetMetadata()
        {
            try
            {
                var meta = await _personalService.GetMetadataAsync();
                return Ok(meta);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener metadata");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpPut("{dni}/terminate")]
        public async Task<ActionResult> Terminate(string dni, [FromBody] TerminationDto termination)
        {
            try
            {
                if (termination == null) return BadRequest("Datos de cese inválidos");

                var result = await _personalService.TerminateAsync(dni, termination.FechaCese, termination.MotivoCese);
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

                // Ensure Inspector field is populated (needed for image folder naming)
                if (string.IsNullOrWhiteSpace(personal.Inspector))
                {
                    personal.Inspector = personal.DNI; // Fallback to DNI if name not provided
                }

                // Handle Images
                if (!string.IsNullOrEmpty(personal.Foto))
                    personal.FotoUrl = await SaveBase64Image(personal.Foto, personal.Inspector, personal.DNI, "foto");
                
                if (!string.IsNullOrEmpty(personal.Firma))
                    personal.FirmaUrl = await SaveBase64Image(personal.Firma, personal.Inspector, personal.DNI, "firma");

                var nuevo = await _personalService.CreateAsync(personal);
                return CreatedAtAction(nameof(GetByDni), new { dni = nuevo.DNI }, nuevo);
            }
            catch (ArgumentException ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear personal");
                return BadRequest($"Error: {ex.Message} | Inner: {ex.InnerException?.Message}");
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

                // Ensure Inspector field is populated (needed for image folder naming)
                if (string.IsNullOrWhiteSpace(personal.Inspector))
                {
                    personal.Inspector = personal.DNI; // Fallback to DNI if name not provided
                }

                // Handle Images
                if (!string.IsNullOrEmpty(personal.Foto))
                    personal.FotoUrl = await SaveBase64Image(personal.Foto, personal.Inspector, personal.DNI, "foto");
                
                if (!string.IsNullOrEmpty(personal.Firma))
                    personal.FirmaUrl = await SaveBase64Image(personal.Firma, personal.Inspector, personal.DNI, "firma");

                var actualizado = await _personalService.UpdateAsync(personal);
                return Ok(actualizado);
            }
            catch (ArgumentException)
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

        [HttpPost("history")]
        public async Task<ActionResult<HistorialCargaPersonal>> RegisterLoadHistory([FromBody] HistorialCargaPersonal history)
        {
            try
            {
                if (history == null)
                    return BadRequest("Datos de historial inválidos");

                history.FechaCarga = DateTime.UtcNow;
                // Ensure user is set if not provided (though frontend should send it)
                if (string.IsNullOrEmpty(history.Usuario))
                    history.Usuario = "Sistema";

                var result = await _personalService.RegisterLoadHistoryAsync(history);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al registrar historial de carga");
                return StatusCode(500, "Error interno del servidor");
            }
        }
        private async Task<string> SaveBase64Image(string base64, string employeeName, string dni, string type)
        {
            try 
            {
                if (string.IsNullOrEmpty(base64)) return null;

                // Strip prefix if present (data:image/png;base64,)
                var data = base64.Contains(",") ? base64.Split(',')[1] : base64;
                var bytes = Convert.FromBase64String(data);
                
                // Sanitize employee name for folder (whitelist approach)
                var safeName = SanitizeFolderName(employeeName);

                // Define base directory
                var baseDir = Path.Combine(_env.WebRootPath ?? "wwwroot", "imagenes", "fotos");
                var fullBaseDir = Path.GetFullPath(baseDir);

                // Ensure base directory ends with separator for secure check
                // This prevents "C:\base" matching "C:\base_secret"
                if (!fullBaseDir.EndsWith(Path.DirectorySeparatorChar.ToString()))
                    fullBaseDir += Path.DirectorySeparatorChar;
                
                // New structure: /imagenes/fotos/{EMPLOYEE_NAME}/
                var folder = Path.Combine(fullBaseDir, safeName);
                var fullFolderPath = Path.GetFullPath(folder);
                
                // SECURITY: Path Traversal Check (Canonical & Strict)
                if (!fullFolderPath.StartsWith(fullBaseDir, StringComparison.OrdinalIgnoreCase))
                {
                    _logger.LogWarning("Security: Path traversal attempt blocked. Base: {Base}, Target: {Target}", fullBaseDir, fullFolderPath);
                    throw new InvalidOperationException("Invalid path detected.");
                }
                
                if (!Directory.Exists(fullFolderPath)) 
                    Directory.CreateDirectory(fullFolderPath);

                // Simple filename: foto.jpg or firma.jpg
                var fileName = $"{type}.jpg";
                var path = Path.Combine(fullFolderPath, fileName);
                
                // Overwrite if exists
                await System.IO.File.WriteAllBytesAsync(path, bytes);
                
                return $"/imagenes/fotos/{safeName}/{fileName}";
            }
            catch (Exception ex)
            {
                // SECURITY: Log Injection Prevention
                var safeEmployeeName = employeeName?.Replace(Environment.NewLine, "").Replace("\n", "").Replace("\r", "");
                var safeDni = dni?.Replace(Environment.NewLine, "").Replace("\n", "").Replace("\r", "");
                
                _logger.LogError(ex, "[IMAGE SAVE ERROR] Failed to save {Type} for {EmployeeName} (DNI: {Dni})", type, safeEmployeeName, safeDni);
                return null;
            }
        }

        private string SanitizeFolderName(string name)
        {
            if (string.IsNullOrWhiteSpace(name)) return "UNKNOWN";
            
            // Whitelist approach: Allow only letters, digits, underscore, and hyphen
            // This is strictly safer than blacklisting characters
            var allowedChars = new HashSet<char>("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-");
            var sanitizedChars = name.Where(c => allowedChars.Contains(c)).ToArray();
            var sanitized = new string(sanitizedChars);

            if (string.IsNullOrWhiteSpace(sanitized)) return "UNKNOWN";
            
            return sanitized.ToUpperInvariant();
        }

        [HttpPost("sync")]
        public async Task<ActionResult> Sync()
        {
            try
            {
                await _personalService.SyncAllAsync();
                return Ok(new { message = "Sincronización completa" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en sincronización masiva");
                return StatusCode(500, "Error interno del servidor");
            }
        }
    }
}
