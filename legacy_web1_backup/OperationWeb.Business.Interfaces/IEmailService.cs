using System.Threading.Tasks;

namespace OperationWeb.Business.Interfaces
{
    public interface IEmailService
    {
        Task SendCredentialsAsync(string email, string dni, string password);
        Task SendPasswordResetAsync(string email, string dni, string token);
    }
}
