using OperationWeb.Business.Interfaces;
using OperationWeb.Core.Entities;
using OperationWeb.Core.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OperationWeb.Business.Services
{
    public class ProyectoService : IProyectoService
    {
        private readonly IProyectoRepository _repository;

        public ProyectoService(IProyectoRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<Proyecto>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<IEnumerable<Proyecto>> GetActiveAsync()
        {
            return await _repository.GetActiveProjectsAsync();
        }

        public async Task<int> SyncProjectsAsync()
        {
            return await _repository.SyncFromPersonalAsync();
        }

        public async Task<string> GetProjectRoleLevelAsync(string dni)
        {
            // TODO: Implement logic against PROYECTOS_ASIGNACION if available.
            // For now, return default to allow AuthController fallback to Category logic.
            return await Task.FromResult("Employee");
        }
    }
}
