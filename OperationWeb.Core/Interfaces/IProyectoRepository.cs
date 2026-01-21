using OperationWeb.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OperationWeb.Core.Interfaces
{
    public interface IProyectoRepository : IRepository<Proyecto>
    {
        Task<IEnumerable<Proyecto>> GetActiveProjectsAsync();
        Task<int> SyncFromPersonalAsync();
    }
}
