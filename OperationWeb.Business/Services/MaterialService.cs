using OperationWeb.Business.Interfaces;
using OperationWeb.Core.Entities;
using OperationWeb.Core.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;

namespace OperationWeb.Business.Services
{
    public class MaterialService : IMaterialService
    {
        private readonly IMaterialRepository _repository;

        public MaterialService(IMaterialRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<Material>> GetAllAsync() => await _repository.GetAllAsync();
        public async Task<Material?> GetByIdAsync(Guid id) => await _repository.GetByIdAsync(id);

        public async Task<Material> CreateAsync(Material material)
        {
            if (material.Id == Guid.Empty) material.Id = Guid.NewGuid();
            if (string.IsNullOrEmpty(material.Tipo)) material.Tipo = "MATERIAL";
            if (string.IsNullOrEmpty(material.UnidadMedida)) material.UnidadMedida = "UND";
            
            return await _repository.AddAsync(material);
        }

        public async Task UpdateAsync(Material material) => await _repository.UpdateAsync(material);
        public async Task DeleteAsync(Guid id) => await _repository.DeleteAsync(id);
    }
}
