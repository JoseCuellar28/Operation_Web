using OperationWeb.DataAccess.Entities;

namespace OperationWeb.DataAccess.Interfaces
{
    public interface IPersonalRepository : IRepository<Personal>
    {
        Task<Personal?> GetByDNIAsync(string dni);
        Task DeleteByDNIAsync(string dni);
        Task<IEnumerable<(Personal Personal, User? User)>> GetAllWithUserStatusAsync();
    }
}
