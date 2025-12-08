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

        public async Task SendPasswordResetAsync(string toEmail, string dni, string token)
        {
            // Get settings from DB or config
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


            // SIMULATION FOR DEV/DEMO ENVIROMENT
            if (host.Contains("example.com") || host == "localhost")
             {
                 Console.WriteLine($"[EmailService] DEV MODE: Simulating email send to {toEmail}");
                 Console.WriteLine($"[EmailService] SUBJECT: Recuperación de Contraseña");
                 
                 // Build reset URL (assuming frontend is on port 8080)
                 string simulatedUrl = $"http://localhost:8080/frontend/Modelo_Funcional/reset-password.html?token={token}";
                 
                 Console.WriteLine($"[EmailService] LINK: {simulatedUrl}");
                 Console.WriteLine($"[EmailService] TOKEN: {token}");

                 return; // Skip actual sending
            }

            int port = int.TryParse(portStr, out int p) ? p : 587;

            // Build reset URL (assuming frontend is on port 8080)
            string resetUrl = $"http://localhost:8080/frontend/Modelo_Funcional/reset-password.html?token={token}";

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
                    Subject = "Recuperación de Contraseña - Operation Web",
                    Body = $@"
                        <h2>Recuperación de Contraseña</h2>
                        <p>Hola,</p>
                        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta (DNI: {dni}).</p>
                        <p>Para crear una nueva contraseña, haz clic en el siguiente enlace:</p>
                        <p><a href=""{resetUrl}"" style=""background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;"">Restablecer Contraseña</a></p>
                        <p>O copia y pega este enlace en tu navegador:</p>
                        <p>{resetUrl}</p>
                        <p><strong>Este enlace expirará en 15 minutos.</strong></p>
                        <p>Si no solicitaste este cambio, ignora este correo.</p>
                        <br>
                        <p>Saludos,<br>Equipo de Operation Web</p>",
                    IsBodyHtml = true
                };
                mailMessage.To.Add(toEmail);

                await client.SendMailAsync(mailMessage);
                Console.WriteLine($"[EmailService] Password reset email sent to {toEmail}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EmailService] Error sending password reset email: {ex.Message}");
            }
        }
    }
}
