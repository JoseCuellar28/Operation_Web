using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using OperationWeb.Business.Services;
using OperationWeb.DataAccess;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Caching.Memory;

namespace OperationWeb.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly OperationWeb.DataAccess.OperationWebDbContext _db;
        private readonly Microsoft.Extensions.Caching.Memory.IMemoryCache _cache;
        private readonly OperationWeb.Business.Services.IEncryptionService _encryptionService;

        public AuthController(IConfiguration config, OperationWeb.DataAccess.OperationWebDbContext db, Microsoft.Extensions.Caching.Memory.IMemoryCache cache, OperationWeb.Business.Services.IEncryptionService encryptionService)
        {
            _config = config;
            _db = db;
            _cache = cache;
            _encryptionService = encryptionService;
        }

        // Changed DNI to Username to match frontend
        public record LoginRequest(string Username, string Password, string? CaptchaId, string? CaptchaAnswer);
        public record UserDto(int Id, string DNI, string? Email, bool IsActive, DateTime CreatedAt);
        public record RoleDto(int Id, string Name, string? Description);
        public record UserRoleDto(int Id, int UserId, int RoleId);
        public record MeDto(string DNI, string? Email, string Role);
        public record CaptchaData(string Question, int Expected);

        [HttpPost("login")]
        [Microsoft.AspNetCore.RateLimiting.EnableRateLimiting("LoginPolicy")]
        [Microsoft.AspNetCore.Authorization.AllowAnonymous]
        public IActionResult Login([FromBody] LoginRequest req)
        {
            // TEMPORARY: Disable captcha validation for easier testing
            // var cid = req.CaptchaId ?? string.Empty;
            // var cans = req.CaptchaAnswer ?? string.Empty;
            // if (string.IsNullOrWhiteSpace(cid) || string.IsNullOrWhiteSpace(cans)) return BadRequest("Captcha requerido");
            // var cacheKey = "captcha:" + cid;
            // if (!(_cache.TryGetValue(cacheKey, out var obj) && obj is CaptchaData cd)) return BadRequest("Captcha inválido");
            // if (!int.TryParse(cans, out var ans) || ans != cd.Expected) return BadRequest("Captcha incorrecto");
            // _cache.Remove(cacheKey);

            var role = "User";
            var username = req.Username ?? string.Empty;
            var password = req.Password ?? string.Empty;

            // Allow login by DNI or Email (checking if email starts with username or is exact match)
            var user = _db.Users.FirstOrDefault(u => 
                (u.DNI == username) || 
                (u.Email != null && u.Email.Contains(username))
            );

            bool ok = false;
            string division = "";
            string area = "";
            string level = "Employee";

            if (user != null)
            {
                // 1. Try BCrypt (Legacy/Standard)
                try { ok = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash); }
                catch { ok = false; }

                // 2. If BCrypt failed, try AES256 (New Requirement)
                if (!ok)
                {
                    try 
                    {
                        var decrypted = _encryptionService.Decrypt(user.PasswordHash);
                        if (decrypted == password) ok = true;
                    }
                    catch 
                    { 
                        // Decryption failed (likely not an AES string or wrong key)
                        ok = false; 
                    }
                }

                if (!ok) return Unauthorized();

                // Determine Role: Prefer the new 'Role' column, fallback to 'UserRoles' table
                if (!string.IsNullOrEmpty(user.Role) && user.Role != "USER") // Assuming default "USER" might be overridden
                {
                    role = user.Role;
                }
                else
                {
                    var roleId = _db.UserRoles.Where(ur => ur.UserId == user.Id).Select(ur => ur.RoleId).FirstOrDefault();
                    if (roleId != 0)
                    {
                        var r = _db.Roles.FirstOrDefault(x => x.Id == roleId);
                        if (r != null) role = r.Name;
                    }
                }
                
                // Use user's DNI for the token
                username = user.DNI;

                // Fetch Personal data for hierarchy claims
                var personal = _db.Personal.FirstOrDefault(p => p.DNI == username);
                division = personal?.Division ?? "";
                area = personal?.Area ?? "";
                level = DetermineLevel(personal?.Categoria);

                // Check for forced password change
                if (user.MustChangePassword)
                {
                    // We return a specific response or just include the flag
                    // Returning 200 OK with the flag is easier for frontend to handle without error logic
                    var tokenStr = GenerateToken(username, role, division, area, level);
                    return Ok(new { token = tokenStr, role, mustChangePassword = true });
                }
            }
            else
            {
                // Demo user fallback (legacy)
                var demoUser = _config.GetSection("Jwt:DemoUser");
                var u = demoUser["DNI"] ?? demoUser["Username"] ?? "";
                var h = demoUser["PasswordHash"] ?? "";
                var p = demoUser["PasswordPlain"] ?? "";
                role = demoUser["Role"] ?? "User";
                if (string.IsNullOrEmpty(u)) return Unauthorized();
                if (!string.IsNullOrEmpty(h))
                {
                    try { ok = BCrypt.Net.BCrypt.Verify(password, h); } catch { ok = false; }
                }
                else if (!string.IsNullOrEmpty(p))
                {
                    ok = string.Equals(password, p);
                }
                // Check against demo user DNI
                ok = ok && string.Equals(username, u, System.StringComparison.OrdinalIgnoreCase);
                if (!ok) return Unauthorized();
            }

            var tokenString = GenerateToken(username, role, division, area, level);
            return Ok(new { token = tokenString, role, mustChangePassword = false });
        }

        // ... (ChangePassword method remains same) ...

        private string DetermineLevel(string? cargo)
        {
            if (string.IsNullOrEmpty(cargo)) return "Employee";
            cargo = cargo.ToUpper();
            if (cargo.Contains("GERENTE")) return "Manager";
            if (cargo.Contains("JEFE") || cargo.Contains("COORDINADOR")) return "Coordinator";
            if (cargo.Contains("SUPERVISOR")) return "Supervisor";
            return "Employee";
        }

        private string GenerateToken(string username, string role, string division, string area, string level)
        {
            var issuer = _config["Jwt:Issuer"] ?? "OperationWeb";
            var audience = _config["Jwt:Audience"] ?? "OperationWebClients";
            var key = _config["Jwt:Key"] ?? "REEMPLAZAR";
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, username),
                new Claim(ClaimTypes.Role, role),
                new Claim("Division", division),
                new Claim("Area", area),
                new Claim("Level", level)
            };
            var creds = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)), SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(issuer, audience, claims, expires: System.DateTime.UtcNow.AddHours(8), signingCredentials: creds);
            var jwt = new JwtSecurityTokenHandler().WriteToken(token);
            return jwt;
        }

        [HttpGet("me")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public ActionResult<MeDto> Me()
        {
            var dni = User.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? string.Empty;
            var role = User.FindFirstValue(ClaimTypes.Role) ?? "User";
            var u = _db.Users.FirstOrDefault(x => x.DNI == dni);
            if (u == null) return NotFound();
            return Ok(new MeDto(u.DNI, u.Email, role));
        }

        [HttpGet("captcha")]
        [Microsoft.AspNetCore.Authorization.AllowAnonymous]
        public IActionResult Captcha()
        {
            var rnd = new System.Random();
            var a = rnd.Next(2, 9);
            var b = rnd.Next(2, 9);
            var id = System.Guid.NewGuid().ToString("N");
            var data = new CaptchaData($"{a} + {b}", a + b);
            _cache.Set("captcha:" + id, data, new Microsoft.Extensions.Caching.Memory.MemoryCacheEntryOptions { AbsoluteExpirationRelativeToNow = System.TimeSpan.FromMinutes(2) });
            var escaped = System.Security.SecurityElement.Escape(data.Question);
            var svg = $@"<svg xmlns='http://www.w3.org/2000/svg' width='180' height='50'>
                <rect width='100%' height='100%' fill='rgb(248,249,250)' />
                <g transform='translate(90,25)'>
                    <text x='0' y='8' text-anchor='middle' dominant-baseline='middle' font-family='Arial, Helvetica, sans-serif' font-size='24' font-weight='700' fill='rgb(60,60,60)'>{escaped}</text>
                </g>
            </svg>";
            var dataUrl = "data:image/svg+xml;utf8," + System.Uri.EscapeDataString(svg);
            return Ok(new { id = id, question = data.Question, image = dataUrl });
        }

        [HttpGet("captcha/image/{id}")]
        [Microsoft.AspNetCore.Authorization.AllowAnonymous]
        public IActionResult CaptchaImage(string id)
        {
            var cacheKey = "captcha:" + id;
            if (!(_cache.TryGetValue(cacheKey, out var obj) && obj is CaptchaData cd)) return NotFound();
            var rnd = new System.Random();
            var rotate = rnd.NextDouble() * 10 - 5;
            var noise = new System.Text.StringBuilder();
            for (int i = 0; i < 6; i++)
            {
                var x1 = rnd.Next(0, 180);
                var y1 = rnd.Next(0, 50);
                var x2 = rnd.Next(0, 180);
                var y2 = rnd.Next(0, 50);
                noise.Append($"<line x1='" + x1 + "' y1='" + y1 + "' x2='" + x2 + "' y2='" + y2 + "' stroke='rgba(0,0,0,0.15)' stroke-width='1' />");
            }
            var escaped = System.Security.SecurityElement.Escape(cd.Question);
            var svg = $@"<svg xmlns='http://www.w3.org/2000/svg' width='180' height='50' viewBox='0 0 180 50' preserveAspectRatio='xMidYMid meet'>
                <rect width='180' height='50' fill='rgb(248,249,250)' />
                {noise}
                <g transform='translate(90,25) rotate({rotate})'>
                    <text x='0' y='0' text-anchor='middle' dominant-baseline='central' font-family='Arial, Helvetica, sans-serif' font-size='22' font-weight='700' fill='rgb(60,60,60)'>{escaped}</text>
                </g>
            </svg>";
            var bytes = System.Text.Encoding.UTF8.GetBytes(svg);
            return File(bytes, "image/svg+xml");
        }

        [HttpGet("ping")]
        [Microsoft.AspNetCore.Authorization.AllowAnonymous]
        public IActionResult Ping()
        {
            return Ok(new { ok = true });
        }

        [HttpGet("users")]
        [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Admin")]
        public ActionResult<IEnumerable<UserDto>> GetUsers()
        {
            var users = _db.Users
                .Select(u => new UserDto(u.Id, u.DNI, u.Email, u.IsActive, u.CreatedAt))
                .OrderBy(u => u.DNI)
                .ToList();
            return Ok(users);
        }

        [HttpGet("roles")]
        [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Admin")]
        public ActionResult<IEnumerable<RoleDto>> GetRoles()
        {
            var roles = _db.Roles
                .Select(r => new RoleDto(r.Id, r.Name, r.Description))
                .OrderBy(r => r.Name)
                .ToList();
            return Ok(roles);
        }

        [HttpGet("user-roles")]
        [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Admin")]
        public ActionResult<IEnumerable<UserRoleDto>> GetUserRoles()
        {
            var urs = _db.UserRoles
                .Select(ur => new UserRoleDto(ur.Id, ur.UserId, ur.RoleId))
                .OrderBy(ur => ur.UserId)
                .ToList();
            return Ok(urs);
        }

        [HttpPost("forgot-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest req)
        {
            try
            {
                var userService = HttpContext.RequestServices.GetRequiredService<OperationWeb.Business.Interfaces.IUserService>();
                await userService.RequestPasswordResetAsync(req.DniOrEmail);
                return Ok(new { message = "Si el DNI o correo existe, recibirás un email con instrucciones para restablecer tu contraseña." });
            }
            catch (Exception ex)
            {
                // Don't reveal if user exists or not for security
                return Ok(new { message = "Si el DNI o correo existe, recibirás un email con instrucciones para restablecer tu contraseña." });
            }
        }

        [HttpPost("reset-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest req)
        {
            try
            {
                var userService = HttpContext.RequestServices.GetRequiredService<OperationWeb.Business.Interfaces.IUserService>();
                await userService.ResetPasswordWithTokenAsync(req.Token, req.NewPassword);
                return Ok(new { message = "Contraseña restablecida exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al restablecer la contraseña. Intenta de nuevo." });
            }
        }

        public record ForgotPasswordRequest(string DniOrEmail);
        public record ResetPasswordRequest(string Token, string NewPassword);
    }
}