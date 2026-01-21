using Microsoft.EntityFrameworkCore;
using OperationWeb.Core.Entities;
using OperationWeb.Core.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;

namespace OperationWeb.DataAccess.Repositories
{
    public class MaterialRepository : IMaterialRepository
    {
        private readonly OperaMainDbContext _context;

        public MaterialRepository(OperaMainDbContext context)
        {
            _context = context;
        }

        public async Task<Material?> GetByIdAsync(Guid id)
        {
            return await _context.Materiales.FindAsync(id);
        }

        public async Task<IEnumerable<Material>> GetAllAsync()
        {
            return await _context.Materiales.OrderBy(m => m.Nombre).ToListAsync();
        }

        public async Task<Material> AddAsync(Material material)
        {
            await _context.Materiales.AddAsync(material);
            await _context.SaveChangesAsync();
            return material;
        }

        public async Task UpdateAsync(Material material)
        {
            _context.Materiales.Update(material);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var entity = await GetByIdAsync(id);
            if (entity != null)
            {
                _context.Materiales.Remove(entity);
                await _context.SaveChangesAsync();
            }
        }
    }
}
