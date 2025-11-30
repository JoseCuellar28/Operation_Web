using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using OperationWeb.DataAccess;
using OperationWeb.DataAccess.Entities;

namespace OperationWeb.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")] // Only Admin can change settings
    public class SystemSettingsController : ControllerBase
    {
        private readonly OperationWebDbContext _context;

        public SystemSettingsController(OperationWebDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetSettings()
        {
            var settings = await _context.SystemSettings.ToListAsync();
            
            // Mask password for security
            var displaySettings = settings.Select(s => new 
            {
                s.Key,
                Value = s.Key.Contains("Password") ? "********" : s.Value,
                s.Description,
                s.UpdatedAt
            });

            return Ok(displaySettings);
        }

        [HttpPost]
        public async Task<IActionResult> UpdateSettings([FromBody] List<SystemSetting> updates)
        {
            foreach (var update in updates)
            {
                // Skip if value is masked and hasn't changed
                if (update.Key.Contains("Password") && update.Value == "********")
                {
                    continue;
                }

                var setting = await _context.SystemSettings.FindAsync(update.Key);
                if (setting == null)
                {
                    setting = new SystemSetting { Key = update.Key };
                    _context.SystemSettings.Add(setting);
                }

                setting.Value = update.Value;
                setting.Description = update.Description;
                setting.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Configuración actualizada correctamente" });
        }
        [HttpPost("test")]
        public async Task<IActionResult> TestEmail([FromBody] TestEmailRequest request)
        {
            try
            {
                var settings = await _context.SystemSettings.ToDictionaryAsync(s => s.Key, s => s.Value);
                
                string host = (settings.ContainsKey("SmtpHost") ? settings["SmtpHost"] : "").Trim();
                string portStr = (settings.ContainsKey("SmtpPort") ? settings["SmtpPort"] : "587").Trim();
                string smtpUser = (settings.ContainsKey("SmtpUser") ? settings["SmtpUser"] : "").Trim();
                string smtpPass = (settings.ContainsKey("SmtpPassword") ? settings["SmtpPassword"] : "").Replace(" ", "").Trim();
                string fromEmail = (settings.ContainsKey("FromEmail") ? settings["FromEmail"] : "").Trim();

                Console.WriteLine($"[SMTP Test] Host: {host}, Port: {portStr}, User: {smtpUser}, PassLen: {smtpPass.Length}");

                if (string.IsNullOrEmpty(host) || string.IsNullOrEmpty(smtpUser) || string.IsNullOrEmpty(smtpPass))
                {
                    return BadRequest("Faltan configuraciones SMTP (Host, Usuario o Contraseña).");
                }

                int port = int.TryParse(portStr, out int p) ? p : 587;

                using var client = new System.Net.Mail.SmtpClient(host, port)
                {
                    Credentials = new System.Net.NetworkCredential(smtpUser, smtpPass),
                    EnableSsl = true,
                    Timeout = 10000 // 10 seconds timeout
                };

                var mailMessage = new System.Net.Mail.MailMessage
                {
                    From = new System.Net.Mail.MailAddress(fromEmail ?? smtpUser),
                    Subject = "Prueba de Configuración SMTP - Operation Web",
                    Body = "<h1>Correo de Prueba</h1><p>Si recibe este correo, la configuración SMTP es correcta.</p>",
                    IsBodyHtml = true
                };
                mailMessage.To.Add(request.ToEmail);

                await client.SendMailAsync(mailMessage);
                return Ok(new { message = "Correo de prueba enviado exitosamente." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al enviar correo: " + ex.Message, details = ex.ToString() });
            }
        }

        public record TestEmailRequest(string ToEmail);
    }
}
