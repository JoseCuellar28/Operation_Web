using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OperationWeb.DataAccess;
using OperationWeb.Core.Entities;

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

        [HttpGet("{id:int}")]
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

        [HttpPut("{id:int}")]
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

        [HttpDelete("{id:int}")]
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
        // DTO for User Role Management
        public class UserRoleDetailDto
        {
            public int UserId { get; set; }
            public string DNI { get; set; } = string.Empty;
            public string Name { get; set; } = string.Empty; // From Personal.Inspector
            public string Division { get; set; } = string.Empty;
            public int? RoleId { get; set; }
            public string RoleName { get; set; } = string.Empty;
            public string? RoleColor { get; set; } // For UI Badge
            public bool IsActive { get; set; }
        }

        public class AssignRoleDto
        {
            public int UserId { get; set; }
            public int RoleId { get; set; }
        }

        [HttpGet("users")]
        public async Task<ActionResult<IEnumerable<UserRoleDetailDto>>> GetUsersWithRoles()
        {
            try 
            {
                // Join Users -> Personal (Name) -> UserRoles (Role)
                var query = from u in _context.Users
                            join p in _context.Personal on u.DNI equals p.DNI into pGroup
                            from p in pGroup.DefaultIfEmpty() // User might not have Personal record, but usually should
                            join ur in _context.UserRoles on u.Id equals ur.UserId into urGroup
                            from ur in urGroup.DefaultIfEmpty()
                            join r in _context.Roles on ur.RoleId equals r.Id into rGroup
                            from r in rGroup.DefaultIfEmpty()
                            select new UserRoleDetailDto
                            {
                                UserId = u.Id,
                                DNI = u.DNI,
                                Name = p != null ? p.Inspector : "Usuario S/N",
                                Division = p != null ? p.Division : "Sin División",
                                RoleId = r != null ? r.Id : (int?)null,
                                RoleName = r != null ? r.Name : "Sin Rol",
                                RoleColor = null, // Frontend will handle color mapping
                                IsActive = u.IsActive
                            };

                var result = await query.ToListAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error obteniendo usuarios", error = ex.Message });
            }
        }

        [HttpPost("assign")]
        public async Task<IActionResult> AssignRole(AssignRoleDto dto)
        {
            try
            {
                // Verify User and Role exist
                var user = await _context.Users.FindAsync(dto.UserId);
                if (user == null) return NotFound("Usuario no encontrado");

                var role = await _context.Roles.FindAsync(dto.RoleId);
                if (role == null) return NotFound("Rol no encontrado");

                // Check if user already has a role
                var currentAssignment = await _context.UserRoles.FirstOrDefaultAsync(ur => ur.UserId == dto.UserId);

                if (currentAssignment != null)
                {
                    // Update existing
                    currentAssignment.RoleId = dto.RoleId;
                    _context.UserRoles.Update(currentAssignment);
                }
                else
                {
                    // Create new assignment
                    var newAssignment = new UserRole
                    {
                        UserId = dto.UserId,
                        RoleId = dto.RoleId
                    };
                    _context.UserRoles.Add(newAssignment);
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Rol asignado correctamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error asignando rol", error = ex.Message });
            }
        }
    }
}
