using OperationWeb.DataAccess.Entities;

namespace OperationWeb.Business.Interfaces
{
    public interface IProyectoService
    {
        Task<IEnumerable<Proyecto>> GetAllProyectosAsync();
        Task<int> SincronizarProyectosDesdePersonalAsync();
        Task AsignarLideresAsync(int proyectoId, string? gerenteDni, string? jefeDni);
    }
}
