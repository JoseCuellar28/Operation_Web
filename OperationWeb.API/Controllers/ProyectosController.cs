using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OperationWeb.Core.DTOs;
using OperationWeb.Core.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OperationWeb.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Protected by default
    public class ProyectosController : ControllerBase
    {
        private readonly IProyectoRepository _proyectoRepository;

        public ProyectosController(IProyectoRepository proyectoRepository)
        {
            _proyectoRepository = proyectoRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProyectoDTO>>> GetAll()
        {
            var proyectos = await _proyectoRepository.GetAllProyectosAsync();
            return Ok(proyectos);
        }
    }
}
