using OperationWeb.DataAccess.Entities;

namespace OperationWeb.Business.Interfaces
{
    public interface IUserService
    {
        Task<User?> AuthenticateAsync(string username, string password);
        Task<(User User, string PlainPassword)> CreateUserAsync(string dni, string role, bool accessWeb = true, bool accessApp = true);
        Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword);
        Task<bool> ToggleStatusAsync(string dni);
        Task<string> RequestPasswordResetAsync(string dniOrEmail);
        Task<bool> ResetPasswordWithTokenAsync(string token, string newPassword);
    }
}
