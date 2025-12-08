using OperationWeb.Business.Interfaces;
using OperationWeb.DataAccess;
using OperationWeb.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using Microsoft.Extensions.Configuration;

namespace OperationWeb.Business.Services
{
    public class UserService : IUserService
    {
        private readonly OperationWebDbContext _context;
        private readonly IEncryptionService _encryptionService;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;

        public UserService(OperationWebDbContext context, IEncryptionService encryptionService, IEmailService emailService, IConfiguration configuration)
        {
            _context = context;
            _encryptionService = encryptionService;
            _emailService = emailService;
            _configuration = configuration;
        }

        public async Task<User?> AuthenticateAsync(string username, string password)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.DNI == username);
            if (user == null || !user.IsActive) return null;

            // Verify password by encrypting input and comparing with stored hash
            // Assuming deterministic encryption (same Key/IV)
            var encryptedInput = _encryptionService.Encrypt(password);
            if (encryptedInput != user.PasswordHash)
                return null;

            return user;
        }

        public async Task<(User User, string PlainPassword)> CreateUserAsync(string dni, string role, bool accessWeb = true, bool accessApp = true)
        {
            // Check if user exists
            var existing = await _context.Users.FirstOrDefaultAsync(u => u.DNI == dni);
            if (existing != null)
            {
                throw new InvalidOperationException($"El usuario con DNI {dni} ya existe.");
            }
            
            // Validate Email Configuration
            var settings = await _context.SystemSettings.ToDictionaryAsync(s => s.Key, s => s.Value);
            string host = settings.ContainsKey("SmtpHost") ? settings["SmtpHost"] : _configuration["EmailSettings:Host"];
            string smtpUser = settings.ContainsKey("SmtpUser") ? settings["SmtpUser"] : _configuration["EmailSettings:UserName"];
            string smtpPass = settings.ContainsKey("SmtpPassword") ? settings["SmtpPassword"] : _configuration["EmailSettings:Password"];

            if (string.IsNullOrEmpty(host) || host.Contains("example.com") || string.IsNullOrEmpty(smtpUser) || string.IsNullOrEmpty(smtpPass))
            {
                 throw new InvalidOperationException("El servicio de correo no está configurado. No se puede crear el usuario sin enviar credenciales.");
            }

            string password = GenerateRandomPassword();
            var encryptedPassword = _encryptionService.Encrypt(password);

            var user = new User
            {
                DNI = dni,
                PasswordHash = encryptedPassword,
                Role = role,
                IsActive = true,
                MustChangePassword = true, // Force change on first login
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Create Access Config
            var accessConfig = new UserAccessConfig 
            { 
                UserId = user.Id, 
                AccessWeb = accessWeb, 
                AccessApp = accessApp,
                LastUpdated = DateTime.UtcNow 
            };
            _context.UserAccessConfigs.Add(accessConfig);
            await _context.SaveChangesAsync();

            // Send email
            var personal = await _context.Personal.FirstOrDefaultAsync(p => p.DNI == dni);
            var email = !string.IsNullOrEmpty(personal?.EmailPersonal) ? personal.EmailPersonal : personal?.Email; 
            
            if (!string.IsNullOrEmpty(email))
            {
                await _emailService.SendCredentialsAsync(email, dni, password);
            }
            else
            {
                System.Console.WriteLine($"[UserService] No email found for DNI {dni}. Password: {password}");
            }

            return (user, password);
        }

        public async Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            var encryptedCurrent = _encryptionService.Encrypt(currentPassword);
            if (encryptedCurrent != user.PasswordHash)
                return false;

            user.PasswordHash = _encryptionService.Encrypt(newPassword);
            user.MustChangePassword = false;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> ToggleStatusAsync(string dni)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.DNI == dni);
            if (user == null) return false;

            user.IsActive = !user.IsActive;
            await _context.SaveChangesAsync();
            return true;
        }

        private string GenerateRandomPassword()
        {
            const string chars = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789!@$";
            var result = new char[8];
            var data = new byte[8];
            
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(data);
            }

            for (int i = 0; i < 8; i++)
            {
                var rnd = data[i] % chars.Length;
                result[i] = chars[rnd];
            }

            return new string(result);
        }

        public async Task<string> RequestPasswordResetAsync(string dniOrEmail)
        {
            // Find user by DNI or email
            var user = await _context.Users.FirstOrDefaultAsync(u => u.DNI == dniOrEmail);
            
            if (user == null)
            {
                // Check in Personal table for email
                var personal = await _context.Personal.FirstOrDefaultAsync(p => 
                    p.EmailPersonal == dniOrEmail || p.Email == dniOrEmail);
                
                if (personal != null)
                {
                    user = await _context.Users.FirstOrDefaultAsync(u => u.DNI == personal.DNI);
                }
            }

            if (user == null)
            {
                throw new InvalidOperationException("No se encontró un usuario con ese DNI o correo electrónico.");
            }

            // Get email from Personal table
            var personalData = await _context.Personal.FirstOrDefaultAsync(p => p.DNI == user.DNI);
            var email = !string.IsNullOrEmpty(personalData?.EmailPersonal) ? personalData.EmailPersonal : personalData?.Email;

            if (string.IsNullOrEmpty(email))
            {
                throw new InvalidOperationException("El usuario no tiene un correo electrónico registrado.");
            }

            // Generate token
            var token = Guid.NewGuid().ToString("N");
            var resetToken = new PasswordResetToken
            {
                DNI = user.DNI,
                Token = token,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddMinutes(15),
                IsUsed = false
            };

            _context.PasswordResetTokens.Add(resetToken);
            await _context.SaveChangesAsync();

            // Send email
            await _emailService.SendPasswordResetAsync(email, user.DNI, token);

            return token;
        }

        public async Task<bool> ResetPasswordWithTokenAsync(string token, string newPassword)
        {
            var resetToken = await _context.PasswordResetTokens
                .FirstOrDefaultAsync(t => t.Token == token && !t.IsUsed);

            if (resetToken == null)
            {
                throw new InvalidOperationException("Token inválido o ya utilizado.");
            }

            if (resetToken.ExpiresAt < DateTime.UtcNow)
            {
                throw new InvalidOperationException("El token ha expirado. Solicite uno nuevo.");
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.DNI == resetToken.DNI);
            if (user == null)
            {
                throw new InvalidOperationException("Usuario no encontrado.");
            }

            // Update password
            user.PasswordHash = _encryptionService.Encrypt(newPassword);
            user.MustChangePassword = false;

            // Mark token as used
            resetToken.IsUsed = true;
            resetToken.UsedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
