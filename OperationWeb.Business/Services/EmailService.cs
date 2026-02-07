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

        public async Task SendWelcomeCredentialsAsync(string toEmail, string username, string password, string token)
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
            string activationUrl = $"http://localhost:5173/activate?token={token}";

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
                    Subject = "Bienvenido a Operation Web - Credenciales de Acceso",
                    Body = $@"
                        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;'>
                            <h2 style='color: #2c3e50;'>¡Bienvenido a Operation Web!</h2>
                            <p>Se ha creado exitosamente tu cuenta de acceso al sistema.</p>
                            
                            <div style='background-color: #f8f9fa; border-left: 4px solid #3498db; padding: 15px; margin: 20px 0;'>
                                <p style='margin: 5px 0;'><strong>Usuario:</strong> {username}</p>
                                <p style='margin: 5px 0;'><strong>Contraseña Temporal:</strong> {password}</p>
                            </div>

                            <p>Para configurar tu contraseña permanente y activar tu cuenta, haz clic en el siguiente botón:</p>
                            
                            <div style='text-align: center; margin: 30px 0;'>
                                <a href='{activationUrl}' style='background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;'>Activar Cuenta y Cambiar Contraseña</a>
                            </div>

                            <p style='color: #7f8c8d; font-size: 0.9em;'>Este enlace expirará en 24 horas por motivos de seguridad.</p>
                            <p>Si tienes problemas con el botón, copia y pega este enlace en tu navegador:</p>
                            <p style='word-break: break-all; color: #3498db;'>{activationUrl}</p>
                            
                            <hr style='border: 0; border-top: 1px solid #eee; margin: 20px 0;'>
                            <p style='font-size: 0.8em; color: #95a5a6;'>Este es un correo automático, por favor no respondas a este mensaje.</p>
                        </div>",
                    IsBodyHtml = true
                };
                mailMessage.To.Add(toEmail);

                await client.SendMailAsync(mailMessage);
                Console.WriteLine($"[EmailService] Welcome email sent to {toEmail}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EmailService] Error sending welcome email: {ex.Message}");
            }
        }

        public async Task SendPasswordResetAsync(string toEmail, string dni, string token)
    {
        Console.WriteLine($"[EmailService] SendPasswordResetAsync called for {toEmail}, DNI: {dni}");
        
        // Get settings from DB or config
        Dictionary<string, string> settings = new Dictionary<string, string>();
        try
        {
            settings = await _context.SystemSettings.ToDictionaryAsync(s => s.Key, s => s.Value);
            Console.WriteLine($"[EmailService] Loaded {settings.Count} settings from database");
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

        Console.WriteLine($"[EmailService] SMTP Config - Host: {host}, Port: {portStr}, User: {smtpUser}, From: {fromEmail}");

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
             string simulatedUrl = $"http://localhost:5173/reset-password?token={token}";
             
             Console.WriteLine($"[EmailService] LINK: {simulatedUrl}");
             Console.WriteLine($"[EmailService] TOKEN: {token}");

             return; // Skip actual sending
        }

        int port = int.TryParse(portStr, out int p) ? p : 587;

        // Build reset URL (assuming frontend is on port 8080)
        string resetUrl = $"http://localhost:5173/reset-password?token={token}";

        Console.WriteLine($"[EmailService] Attempting to send email via {host}:{port}");

        try
        {
            using var client = new SmtpClient(host, port)
            {
                Credentials = new NetworkCredential(smtpUser, smtpPass),
                EnableSsl = true
            };

            Console.WriteLine("[EmailService] SMTP client created, preparing message...");

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

            Console.WriteLine($"[EmailService] Sending email to {toEmail}...");
            await client.SendMailAsync(mailMessage);
            Console.WriteLine($"[EmailService] ✅ Password reset email sent successfully to {toEmail}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[EmailService] ❌ Error sending password reset email: {ex.Message}");
            Console.WriteLine($"[EmailService] Stack trace: {ex.StackTrace}");
            throw; // Re-throw to propagate error
        }
    }
    }
}
