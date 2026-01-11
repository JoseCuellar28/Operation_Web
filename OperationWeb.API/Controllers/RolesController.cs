using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OperationWeb.DataAccess;
using OperationWeb.DataAccess.Entities;

namespace OperationWeb.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RolesController : ControllerBase
    {
        private readonly OperationWebDbContext _context;

        public RolesController(OperationWebDbContext context)
        {
            _context = context;
        }

        // DTO for Role with Stats (UserCount)
        public class RoleWithStatsDto
        {
            public int Id { get; set; }
            public string Name { get; set; } = string.Empty;
            public string? Description { get; set; }
            public int UserCount { get; set; }
        }

        public class CreateRoleDto
        {
            public string Name { get; set; } = string.Empty;
            public string? Description { get; set; }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RoleWithStatsDto>>> GetAll()
        {
            try 
            {
                var roles = await _context.Roles
                    .Select(r => new RoleWithStatsDto
                    {
                        Id = r.Id,
                        Name = r.Name,
                        Description = r.Description,
                        // Count users assigned to this role
                        UserCount = _context.UserRoles.Count(ur => ur.RoleId == r.Id)
                    })
                    .OrderBy(r => r.Name)
                    .ToListAsync();

                return Ok(roles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno al obtener roles", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Role>> GetById(int id)
        {
            var role = await _context.Roles.FindAsync(id);
            if (role == null) return NotFound("Rol no encontrado");
            return Ok(role);
        }

        [HttpPost]
        public async Task<ActionResult<Role>> Create(CreateRoleDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest("El nombre del rol es obligatorio");

            // Check duplicate name
            if (await _context.Roles.AnyAsync(r => r.Name == dto.Name))
                return BadRequest("Ya existe un rol con este nombre");

            var role = new Role
            {
                Name = dto.Name,
                Description = dto.Description
            };

            _context.Roles.Add(role);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = role.Id }, role);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, CreateRoleDto dto)
        {
            var role = await _context.Roles.FindAsync(id);
            if (role == null) return NotFound("Rol no encontrado");

            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest("El nombre del rol es obligatorio");

            // Check duplicate name (excluding current role)
            if (await _context.Roles.AnyAsync(r => r.Name == dto.Name && r.Id != id))
                return BadRequest("Ya existe otro rol con este nombre");

            role.Name = dto.Name;
            role.Description = dto.Description;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var role = await _context.Roles.FindAsync(id);
            if (role == null) return NotFound("Rol no encontrado");

            // Integrity Check: Prevent delete if users are assigned
            var hasUsers = await _context.UserRoles.AnyAsync(ur => ur.RoleId == id);
            if (hasUsers)
                return BadRequest($"No se puede eliminar el rol '{role.Name}' porque tiene usuarios asignados.");

            _context.Roles.Remove(role);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
