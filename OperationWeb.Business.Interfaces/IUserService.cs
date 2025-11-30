using OperationWeb.DataAccess.Entities;

namespace OperationWeb.Business.Interfaces
{
    public interface IUserService
    {
        Task<User?> AuthenticateAsync(string username, string password);
        Task<User> CreateUserAsync(string dni, string role);
        Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword);
        Task<bool> ToggleStatusAsync(string dni);
    }
}
