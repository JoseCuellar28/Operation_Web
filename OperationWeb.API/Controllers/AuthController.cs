using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;
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

        public AuthController(IConfiguration config, OperationWeb.DataAccess.OperationWebDbContext db, Microsoft.Extensions.Caching.Memory.IMemoryCache cache)
        {
            _config = config;
            _db = db;
            _cache = cache;
        }

        public record LoginRequest(string Username, string Password, string? CaptchaId, string? CaptchaAnswer);
        public record UserDto(int Id, string Username, string? Email, bool IsActive, DateTime CreatedAt);
        public record RoleDto(int Id, string Name, string? Description);
        public record UserRoleDto(int Id, int UserId, int RoleId);
        public record MeDto(string Username, string? Email, string FullName, string? Company, string Role);
        public record CaptchaData(string Question, int Expected);

        [HttpPost("login")]
        [Microsoft.AspNetCore.RateLimiting.EnableRateLimiting("LoginPolicy")]
        [Microsoft.AspNetCore.Authorization.AllowAnonymous]
        public IActionResult Login([FromBody] LoginRequest req)
        {
            var cid = req.CaptchaId ?? string.Empty;
            var cans = req.CaptchaAnswer ?? string.Empty;
            if (string.IsNullOrWhiteSpace(cid) || string.IsNullOrWhiteSpace(cans)) return BadRequest("Captcha requerido");
            var cacheKey = "captcha:" + cid;
            if (!(_cache.TryGetValue(cacheKey, out var obj) && obj is CaptchaData cd)) return BadRequest("Captcha inválido");
            if (!int.TryParse(cans, out var ans) || ans != cd.Expected) return BadRequest("Captcha incorrecto");
            _cache.Remove(cacheKey);
            var role = "User";
            var username = req.Username ?? string.Empty;
            var password = req.Password ?? string.Empty;

            var user = _db.Users.FirstOrDefault(u => u.Username == username && u.IsActive);
            bool ok = false;
            if (user != null)
            {
                try { ok = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash); }
                catch { ok = false; }
                if (!ok) return Unauthorized();
                var roleId = _db.UserRoles.Where(ur => ur.UserId == user.Id).Select(ur => ur.RoleId).FirstOrDefault();
                if (roleId != 0)
                {
                    var r = _db.Roles.FirstOrDefault(x => x.Id == roleId);
                    if (r != null) role = r.Name;
                }
            }
            else
            {
                var demoUser = _config.GetSection("Jwt:DemoUser");
                var u = demoUser["Username"] ?? "";
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
                ok = ok && string.Equals(username, u, System.StringComparison.OrdinalIgnoreCase);
                if (!ok) return Unauthorized();
            }

            var issuer = _config["Jwt:Issuer"] ?? "OperationWeb";
            var audience = _config["Jwt:Audience"] ?? "OperationWebClients";
            var key = _config["Jwt:Key"] ?? "REEMPLAZAR";
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, username),
                new Claim(ClaimTypes.Role, role),
            };
            var creds = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)), SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(issuer, audience, claims, expires: System.DateTime.UtcNow.AddHours(8), signingCredentials: creds);
            var jwt = new JwtSecurityTokenHandler().WriteToken(token);
            return Ok(new { token = jwt });
        }

        [HttpGet("me")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public ActionResult<MeDto> Me()
        {
            var username = User.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? string.Empty;
            var role = User.FindFirstValue(ClaimTypes.Role) ?? "User";
            var u = _db.Users.FirstOrDefault(x => x.Username == username);
            if (u == null) return NotFound();
            return Ok(new MeDto(u.Username, u.Email, u.FullName, u.Company, role));
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
            return Ok(new { id = id, question = data.Question });
        }

        [HttpGet("captcha/image/{id}")]
        [Microsoft.AspNetCore.Authorization.AllowAnonymous]
        public IActionResult CaptchaImage(string id)
        {
            var cacheKey = "captcha:" + id;
            if (!(_cache.TryGetValue(cacheKey, out var obj) && obj is CaptchaData cd)) return NotFound();
            using var bmp = new System.Drawing.Bitmap(180, 50);
            using var g = System.Drawing.Graphics.FromImage(bmp);
            g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
            g.Clear(System.Drawing.Color.FromArgb(248, 249, 250));
            var rnd = new System.Random();
            for (int i = 0; i < 6; i++)
            {
                using var pen = new System.Drawing.Pen(System.Drawing.Color.FromArgb(30, 0, 0, 0), 1);
                g.DrawLine(pen, rnd.Next(0, 180), rnd.Next(0, 50), rnd.Next(0, 180), rnd.Next(0, 50));
            }
            using var font = new System.Drawing.Font("Arial", 24, System.Drawing.FontStyle.Bold);
            using var brush = new System.Drawing.SolidBrush(System.Drawing.Color.FromArgb(60, 60, 60));
            var format = new System.Drawing.StringFormat { Alignment = System.Drawing.StringAlignment.Center, LineAlignment = System.Drawing.StringAlignment.Center };
            g.TranslateTransform(90, 25);
            g.RotateTransform((float)(rnd.NextDouble() * 12 - 6));
            g.DrawString(cd.Question, font, brush, 0, 0, format);
            g.ResetTransform();
            using var ms = new System.IO.MemoryStream();
            bmp.Save(ms, System.Drawing.Imaging.ImageFormat.Png);
            return File(ms.ToArray(), "image/png");
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
                .Select(u => new UserDto(u.Id, u.Username, u.Email, u.IsActive, u.CreatedAt))
                .OrderBy(u => u.Username)
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
    }
}