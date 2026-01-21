using Microsoft.EntityFrameworkCore;
using OperationWeb.Core.Entities;
using OperationWeb.Core.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OperationWeb.DataAccess.Repositories
{
    public class VehiculoRepository : IVehiculoRepository
    {
        private readonly OperaMainDbContext _context;

        public VehiculoRepository(OperaMainDbContext context)
        {
            _context = context;
        }

        public async Task<Vehiculo?> GetByIdAsync(string placa)
        {
            return await _context.Vehiculos.FindAsync(placa);
        }

        public async Task<IEnumerable<Vehiculo>> GetAllAsync()
        {
            return await _context.Vehiculos.OrderBy(v => v.Placa).ToListAsync();
        }

        public async Task<IEnumerable<Vehiculo>> GetOperativosAsync()
        {
            return await _context.Vehiculos
                .Where(v => v.Estado == "OPERATIVO")
                .OrderBy(v => v.Placa)
                .ToListAsync();
        }

        public async Task<Vehiculo> AddAsync(Vehiculo vehiculo)
        {
            await _context.Vehiculos.AddAsync(vehiculo);
            await _context.SaveChangesAsync();
            return vehiculo;
        }

        public async Task UpdateAsync(Vehiculo vehiculo)
        {
            _context.Vehiculos.Update(vehiculo);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(string placa)
        {
            var entity = await GetByIdAsync(placa);
            if (entity != null)
            {
                _context.Vehiculos.Remove(entity);
                await _context.SaveChangesAsync();
            }
        }
    }
}
