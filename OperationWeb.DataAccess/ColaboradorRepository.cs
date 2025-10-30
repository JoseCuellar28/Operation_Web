using Microsoft.EntityFrameworkCore;
using OperationWeb.DataAccess.Entities;
using OperationWeb.DataAccess.Interfaces;

namespace OperationWeb.DataAccess
{
    public class ColaboradorRepository : Repository<Colaborador>, IColaboradorRepository
    {
        public ColaboradorRepository(OperationWebDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Colaborador>> GetColaboradoresByEstadoAsync(string estado)
        {
            return await _dbSet
                .Where(c => c.Estado == estado)
                .ToListAsync();
        }

        public async Task<IEnumerable<Colaborador>> GetColaboradoresByCargoAsync(string cargo)
        {
            return await _dbSet
                .Where(c => c.Cargo == cargo && c.Estado == "Activo")
                .ToListAsync();
        }

        public async Task<IEnumerable<Colaborador>> GetColaboradoresDisponiblesAsync()
        {
            // Colaboradores activos que no están asignados a ninguna cuadrilla activa
            var colaboradoresAsignados = await _context.CuadrillaColaboradores
                .Where(cc => cc.Activo)
                .Select(cc => cc.ColaboradorId)
                .ToListAsync();

            return await _dbSet
                .Where(c => c.Estado == "Activo" && !colaboradoresAsignados.Contains(c.Id))
                .ToListAsync();
        }

        public async Task<IEnumerable<Cuadrilla>> GetCuadrillasByColaboradorAsync(int colaboradorId)
        {
            return await _context.CuadrillaColaboradores
                .Where(cc => cc.ColaboradorId == colaboradorId && cc.Activo)
                .Include(cc => cc.Cuadrilla)
                .Select(cc => cc.Cuadrilla)
                .ToListAsync();
        }

        public async Task<Colaborador?> GetByDocumentoAsync(string documento)
        {
            return await _dbSet
                .FirstOrDefaultAsync(c => c.Documento == documento);
        }

        public async Task<Colaborador?> GetByEmailAsync(string email)
        {
            return await _dbSet
                .FirstOrDefaultAsync(c => c.Email == email);
        }
    }
}