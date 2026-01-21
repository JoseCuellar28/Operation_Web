using OperationWeb.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;

namespace OperationWeb.Business.Interfaces
{
    public interface IMaterialService
    {
        Task<IEnumerable<Material>> GetAllAsync();
        Task<Material?> GetByIdAsync(Guid id);
        Task<Material> CreateAsync(Material material);
        Task UpdateAsync(Material material);
        Task DeleteAsync(Guid id);
    }
}
