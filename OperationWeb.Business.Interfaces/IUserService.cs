using OperationWeb.Core.Entities;

namespace OperationWeb.Business.Interfaces
{
    public interface IUserService
    {
        // Legacy Auth (to be deprecated eventually, but kept for interface stability if needed)
        Task<User?> AuthenticateAsync(string username, string password);
        
        // Modern Auth (Rich Response)
        Task<(User User, string Role, bool MustChangePassword, UserAccessConfig? AccessConfig)> LoginAsync(string username, string password);
        
        Task<(User User, string PlainPassword)> CreateUserAsync(string dni, string role, bool accessWeb = true, bool accessApp = true);
        Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword);
        Task<bool> ToggleStatusAsync(string dni);
        Task<string> RequestPasswordResetAsync(string dniOrEmail);
        Task<bool> ResetPasswordWithTokenAsync(string token, string newPassword);
        
        // Admin Methods
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task<IEnumerable<Role>> GetAllRolesAsync();
        Task<IEnumerable<UserRole>> GetAllUserRolesAsync();
    }
}
