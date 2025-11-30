using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using OperationWeb.Business.Interfaces;
using OperationWeb.DataAccess;

namespace OperationWeb.Business.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly OperationWebDbContext _context;

        public EmailService(IConfiguration configuration, OperationWebDbContext context)
        {
            _configuration = configuration;
            _context = context;
        }

        public async Task SendCredentialsAsync(string toEmail, string username, string password)
        {
            // 1. Try to get settings from DB
            Dictionary<string, string> settings = new Dictionary<string, string>();
            try
            {
                settings = await _context.SystemSettings.ToDictionaryAsync(s => s.Key, s => s.Value);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EmailService] Error fetching settings from DB: {ex.Message}");
            }
            
            string host = settings.ContainsKey("SmtpHost") ? settings["SmtpHost"] : _configuration["EmailSettings:Host"];
            string portStr = settings.ContainsKey("SmtpPort") ? settings["SmtpPort"] : _configuration["EmailSettings:Port"];
            string smtpUser = settings.ContainsKey("SmtpUser") ? settings["SmtpUser"] : _configuration["EmailSettings:UserName"];
            string smtpPass = settings.ContainsKey("SmtpPassword") ? settings["SmtpPassword"] : _configuration["EmailSettings:Password"];
            string fromEmail = settings.ContainsKey("FromEmail") ? settings["FromEmail"] : _configuration["EmailSettings:FromEmail"];

            if (string.IsNullOrEmpty(host) || string.IsNullOrEmpty(smtpUser) || string.IsNullOrEmpty(smtpPass))
            {
                Console.WriteLine("[EmailService] SMTP settings not configured. Skipping email.");
                return;
            }

            int port = int.TryParse(portStr, out int p) ? p : 587;

            try
            {
                using var client = new SmtpClient(host, port)
                {
                    Credentials = new NetworkCredential(smtpUser, smtpPass),
                    EnableSsl = true
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(fromEmail ?? "no-reply@operationweb.com"),
                    Subject = "Credenciales de Acceso - Operation Web",
                    Body = $@"
                        <h2>Bienvenido a Operation Web</h2>
                        <p>Se ha creado su cuenta de usuario.</p>
                        <p><strong>Usuario:</strong> {username}</p>
                        <p><strong>Contraseña Temporal:</strong> {password}</p>
                        <p>Por favor ingrese y cambie su contraseña inmediatamente.</p>",
                    IsBodyHtml = true
                };
                mailMessage.To.Add(toEmail);

                await client.SendMailAsync(mailMessage);
                Console.WriteLine($"[EmailService] Email sent to {toEmail}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EmailService] Error sending email: {ex.Message}");
            }
        }
    }
}
