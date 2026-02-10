using OperationWeb.Core.Entities;

namespace OperationWeb.Core.Interfaces
{
    public interface IPersonalRepository : IRepository<Personal>
    {
        Task<Personal?> GetByDNIAsync(string dni);
        Task DeleteByDNIAsync(string dni);
        Task<IEnumerable<(Personal Personal, User? User)>> GetAllWithUserStatusAsync();
        Task<(IEnumerable<string> Divisions, IEnumerable<string> Areas, IEnumerable<string> Categories)> GetMetadataAsync();
        Task<HistorialCargaPersonal> RegisterLoadHistoryAsync(HistorialCargaPersonal history);

    }
}
