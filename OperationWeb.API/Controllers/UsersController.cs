using Microsoft.AspNetCore.Mvc;
using OperationWeb.Business.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace OperationWeb.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Require login
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        public record CreateUserRequest(string DNI, string? Password, string Role);

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.DNI))
            {
                return BadRequest("DNI es requerido.");
            }

            try
            {
                var user = await _userService.CreateUserAsync(req.DNI, req.Role);
                return Ok(new { id = user.Id, dni = user.DNI, role = user.Role });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message); // 409 Conflict if user exists
            }
            catch (Exception ex)
            {
                // Log error
                return StatusCode(500, "Error interno al crear usuario: " + ex.Message);
            }
        }

        [HttpPut("{dni}/toggle-status")]
        public async Task<IActionResult> ToggleStatus(string dni)
        {
            try
            {
                var result = await _userService.ToggleStatusAsync(dni);
                if (!result) return NotFound($"Usuario con DNI {dni} no encontrado");
                return Ok(new { message = "Estado actualizado correctamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error interno al actualizar estado: " + ex.Message);
            }
        }
    }
}
