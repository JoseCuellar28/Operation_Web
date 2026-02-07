using System.Threading.Tasks;

namespace OperationWeb.Business.Interfaces
{
    public interface IEmailService
    {
        Task SendCredentialsAsync(string email, string dni, string password);
        Task SendWelcomeCredentialsAsync(string email, string dni, string tempPassword, string activationToken);
        Task SendPasswordResetAsync(string email, string dni, string token);
    }
}
