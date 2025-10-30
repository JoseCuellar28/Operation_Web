using OperationWeb.DataAccess.Entities;

namespace OperationWeb.Business.Interfaces
{
    public interface ICuadrillaService
    {
        Task<IEnumerable<Cuadrilla>> GetAllCuadrillasAsync();
        Task<Cuadrilla?> GetCuadrillaByIdAsync(int id);
        Task<Cuadrilla?> GetCuadrillaWithColaboradoresAsync(int id);
        Task<IEnumerable<Cuadrilla>> GetCuadrillasByEstadoAsync(string estado);
        Task<Cuadrilla> CreateCuadrillaAsync(Cuadrilla cuadrilla);
        Task<Cuadrilla> UpdateCuadrillaAsync(Cuadrilla cuadrilla);
        Task<bool> DeleteCuadrillaAsync(int id);
        Task<bool> AsignarColaboradorAsync(int cuadrillaId, int colaboradorId, string? rol = null);
        Task<bool> DesasignarColaboradorAsync(int cuadrillaId, int colaboradorId);
        Task<IEnumerable<Colaborador>> GetColaboradoresByCuadrillaAsync(int cuadrillaId);
        Task<bool> ValidarCapacidadCuadrillaAsync(int cuadrillaId);
        Task<int> GetCapacidadDisponibleAsync(int cuadrillaId);
    }
}