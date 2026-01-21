using Microsoft.AspNetCore.Mvc;
using OperationWeb.Business.Interfaces;
using System;
using System.Threading.Tasks;

namespace OperationWeb.API.Controllers
{
    [Route("api/proyectos")]
    [ApiController]
    public class ProyectosController : ControllerBase
    {
        private readonly IProyectoService _service;

        public ProyectosController(IProyectoService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var result = await _service.GetAllAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving projects", error = ex.Message });
            }
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActive()
        {
             try
            {
                var result = await _service.GetActiveAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving active projects", error = ex.Message });
            }
        }

        [HttpPost("sync")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> Sync()
        {
            try
            {
                var count = await _service.SyncProjectsAsync();
                return Ok(new { message = $"Sincronización completada. {count} nuevos proyectos creados." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error sincronizando proyectos", error = ex.Message });
            }
        }
    }
}
