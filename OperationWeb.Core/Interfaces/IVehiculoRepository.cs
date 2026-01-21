using OperationWeb.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OperationWeb.Core.Interfaces
{
    public interface IVehiculoRepository
    {
        Task<Vehiculo?> GetByIdAsync(string placa);
        Task<IEnumerable<Vehiculo>> GetAllAsync();
        Task<IEnumerable<Vehiculo>> GetOperativosAsync();
        Task<Vehiculo> AddAsync(Vehiculo vehiculo);
        Task UpdateAsync(Vehiculo vehiculo);
        Task DeleteAsync(string placa);
    }
}
