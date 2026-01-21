using OperationWeb.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OperationWeb.Business.Interfaces
{
    public interface IVehiculoService
    {
        Task<IEnumerable<Vehiculo>> GetAllAsync();
        Task<IEnumerable<Vehiculo>> GetOperativosAsync();
        Task<Vehiculo?> GetByIdAsync(string placa);
        Task<Vehiculo> CreateAsync(Vehiculo vehiculo);
        Task UpdateAsync(Vehiculo vehiculo);
        Task DeleteAsync(string placa);
    }
}
