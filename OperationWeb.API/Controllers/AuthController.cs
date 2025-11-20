using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

namespace OperationWeb.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _config;

        public AuthController(IConfiguration config)
        {
            _config = config;
        }

        public record LoginRequest(string Username, string Password);

        [HttpPost("login")]
        [Microsoft.AspNetCore.RateLimiting.EnableRateLimiting("LoginPolicy")]
        [Microsoft.AspNetCore.Authorization.AllowAnonymous]
        public IActionResult Login([FromBody] LoginRequest req)
        {
            var demoUser = _config.GetSection("Jwt:DemoUser");
            var u = demoUser["Username"] ?? "";
            var h = demoUser["PasswordHash"] ?? "";
            var p = demoUser["PasswordPlain"] ?? "";
            var role = demoUser["Role"] ?? "User";
            if (string.IsNullOrEmpty(u)) return Unauthorized();
            bool ok = false;
            if (!string.IsNullOrEmpty(h))
            {
                try
                {
                    ok = BCrypt.Net.BCrypt.Verify(req.Password ?? string.Empty, h);
                }
                catch
                {
                    ok = false;
                }
            }
            if (string.IsNullOrEmpty(h)) return Unauthorized();
            ok = ok && string.Equals(req.Username, u, System.StringComparison.OrdinalIgnoreCase);
            if (!ok) return Unauthorized();

            var issuer = _config["Jwt:Issuer"] ?? "OperationWeb";
            var audience = _config["Jwt:Audience"] ?? "OperationWebClients";
            var key = _config["Jwt:Key"] ?? "REEMPLAZAR";
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, req.Username),
                new Claim(ClaimTypes.Role, role),
            };
            var creds = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)), SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(issuer, audience, claims, expires: System.DateTime.UtcNow.AddHours(8), signingCredentials: creds);
            var jwt = new JwtSecurityTokenHandler().WriteToken(token);
            return Ok(new { token = jwt });
        }
    }
}