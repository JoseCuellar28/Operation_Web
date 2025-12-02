using Microsoft.AspNetCore.Mvc;

namespace OperationWeb.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProyectosController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetAll()
        {
            // Placeholder: Return empty list to prevent 404
            return Ok(new List<object>());
        }
    }
}
