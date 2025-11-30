using OperationWeb.Business.Interfaces;
using OperationWeb.DataAccess;
using OperationWeb.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;

namespace OperationWeb.Business.Services
{
    public class UserService : IUserService
    {
        private readonly OperationWebDbContext _context;
        private readonly IEncryptionService _encryptionService;
        private readonly IEmailService _emailService;

        public UserService(OperationWebDbContext context, IEncryptionService encryptionService, IEmailService emailService)
        {
            _context = context;
            _encryptionService = encryptionService;
            _emailService = emailService;
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

        public async Task<User> CreateUserAsync(string dni, string role)
        {
            // Check if user exists
            var existing = await _context.Users.FirstOrDefaultAsync(u => u.DNI == dni);
            if (existing != null)
            {
                throw new InvalidOperationException($"El usuario con DNI {dni} ya existe.");
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

            return user;
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
    }
}
