using OperationWeb.DataAccess.Entities;

namespace OperationWeb.DataAccess.Interfaces
{
    public interface ICuadrillaRepository : IRepository<Cuadrilla>
    {
        Task<IEnumerable<Cuadrilla>> GetCuadrillasByEstadoAsync(string estado);
        Task<IEnumerable<Cuadrilla>> GetCuadrillasWithColaboradoresAsync();
        Task<Cuadrilla?> GetCuadrillaWithColaboradoresAsync(int id);
        Task<bool> AsignarColaboradorAsync(int cuadrillaId, int colaboradorId, string? rol = null);
        Task<bool> DesasignarColaboradorAsync(int cuadrillaId, int colaboradorId);
        Task<IEnumerable<Colaborador>> GetColaboradoresByCuadrillaAsync(int cuadrillaId);
        Task<int> GetCapacidadDisponibleAsync(int cuadrillaId);
    }
}