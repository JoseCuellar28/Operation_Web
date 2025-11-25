using OperationWeb.DataAccess.Entities;

namespace OperationWeb.DataAccess.Interfaces
{
    public interface ICuadrillaRepository : IRepository<Cuadrilla>
    {
        Task<IEnumerable<Cuadrilla>> GetCuadrillasByEstadoAsync(string estado);
        Task<IEnumerable<Cuadrilla>> GetCuadrillasWithPersonalAsync();
        Task<Cuadrilla?> GetCuadrillaWithPersonalAsync(int id);
        Task<bool> AsignarPersonalAsync(int cuadrillaId, string personalDNI, string? rol = null);
        Task<bool> DesasignarPersonalAsync(int cuadrillaId, string personalDNI);
        Task<IEnumerable<Personal>> GetPersonalByCuadrillaAsync(int cuadrillaId);
        Task<int> GetCapacidadDisponibleAsync(int cuadrillaId);
    }
}