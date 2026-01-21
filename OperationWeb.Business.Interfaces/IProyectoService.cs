using OperationWeb.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OperationWeb.Business.Interfaces
{
    public interface IProyectoService
    {
        Task<IEnumerable<Proyecto>> GetAllAsync();
        Task<IEnumerable<Proyecto>> GetActiveAsync();
        Task<int> SyncProjectsAsync();
        Task<string> GetProjectRoleLevelAsync(string dni);
    }
}
