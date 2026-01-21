using OperationWeb.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;

namespace OperationWeb.Core.Interfaces
{
    public interface IMaterialRepository
    {
        Task<Material?> GetByIdAsync(Guid id);
        Task<IEnumerable<Material>> GetAllAsync();
        Task<Material> AddAsync(Material material);
        Task UpdateAsync(Material material);
        Task DeleteAsync(Guid id);
    }
}
