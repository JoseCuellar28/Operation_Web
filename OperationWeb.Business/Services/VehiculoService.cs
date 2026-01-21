using OperationWeb.Business.Interfaces;
using OperationWeb.Core.Entities;
using OperationWeb.Core.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OperationWeb.Business.Services
{
    public class VehiculoService : IVehiculoService
    {
        private readonly IVehiculoRepository _repository;

        public VehiculoService(IVehiculoRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<Vehiculo>> GetAllAsync() => await _repository.GetAllAsync();
        public async Task<IEnumerable<Vehiculo>> GetOperativosAsync() => await _repository.GetOperativosAsync();
        public async Task<Vehiculo?> GetByIdAsync(string placa) => await _repository.GetByIdAsync(placa);

        public async Task<Vehiculo> CreateAsync(Vehiculo vehiculo)
        {
            if (string.IsNullOrEmpty(vehiculo.Estado)) vehiculo.Estado = "OPERATIVO";
            if (string.IsNullOrEmpty(vehiculo.MaxVolumen)) vehiculo.MaxVolumen = "BAJO";
            
            return await _repository.AddAsync(vehiculo);
        }

        public async Task UpdateAsync(Vehiculo vehiculo) => await _repository.UpdateAsync(vehiculo);
        public async Task DeleteAsync(string placa) => await _repository.DeleteAsync(placa);
    }
}
