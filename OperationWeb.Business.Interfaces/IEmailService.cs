using System.Threading.Tasks;

namespace OperationWeb.Business.Interfaces
{
    public interface IEmailService
    {
        Task SendWelcomeCredentialsAsync(string email, string dni, string activationToken);
        Task SendPasswordResetAsync(string email, string dni, string token);
    }
}
