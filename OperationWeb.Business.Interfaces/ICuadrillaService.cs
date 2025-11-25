using OperationWeb.DataAccess.Entities;

namespace OperationWeb.Business.Interfaces
{
    public interface ICuadrillaService
    {
        Task<IEnumerable<Cuadrilla>> GetAllCuadrillasAsync();
        Task<Cuadrilla?> GetCuadrillaByIdAsync(int id);
        Task<Cuadrilla?> GetCuadrillaWithPersonalAsync(int id);
        Task<IEnumerable<Cuadrilla>> GetCuadrillasByEstadoAsync(string estado);
        Task<Cuadrilla> CreateCuadrillaAsync(Cuadrilla cuadrilla);
        Task<Cuadrilla> UpdateCuadrillaAsync(Cuadrilla cuadrilla);
        Task<bool> DeleteCuadrillaAsync(int id);
        Task<bool> AsignarPersonalAsync(int cuadrillaId, string personalDNI, string? rol = null);
        Task<bool> DesasignarPersonalAsync(int cuadrillaId, string personalDNI);
        Task<IEnumerable<Personal>> GetPersonalByCuadrillaAsync(int cuadrillaId);
        Task<bool> ValidarCapacidadCuadrillaAsync(int cuadrillaId);
        Task<int> GetCapacidadDisponibleAsync(int cuadrillaId);
    }
}