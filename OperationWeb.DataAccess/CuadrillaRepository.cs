using Microsoft.EntityFrameworkCore;
using OperationWeb.DataAccess.Entities;
using OperationWeb.DataAccess.Interfaces;

namespace OperationWeb.DataAccess
{
    public class CuadrillaRepository : Repository<Cuadrilla>, ICuadrillaRepository
    {
        public CuadrillaRepository(OperationWebDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Cuadrilla>> GetCuadrillasByEstadoAsync(string estado)
        {
            return await _dbSet
                .Where(c => c.Estado == estado)
                .ToListAsync();
        }

        public async Task<IEnumerable<Cuadrilla>> GetCuadrillasWithColaboradoresAsync()
        {
            return await _dbSet
                .Include(c => c.CuadrillaColaboradores)
                    .ThenInclude(cc => cc.Colaborador)
                .ToListAsync();
        }

        public async Task<Cuadrilla?> GetCuadrillaWithColaboradoresAsync(int id)
        {
            return await _dbSet
                .Include(c => c.CuadrillaColaboradores.Where(cc => cc.Activo))
                    .ThenInclude(cc => cc.Colaborador)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<bool> AsignarColaboradorAsync(int cuadrillaId, int colaboradorId, string? rol = null)
        {
            try
            {
                // Verificar si ya existe una asignación activa
                var existeAsignacion = await _context.CuadrillaColaboradores
                    .AnyAsync(cc => cc.CuadrillaId == cuadrillaId && 
                                   cc.ColaboradorId == colaboradorId && 
                                   cc.Activo);

                if (existeAsignacion)
                    return false;

                // Verificar capacidad disponible
                var capacidadDisponible = await GetCapacidadDisponibleAsync(cuadrillaId);
                if (capacidadDisponible <= 0)
                    return false;

                var asignacion = new CuadrillaColaborador
                {
                    CuadrillaId = cuadrillaId,
                    ColaboradorId = colaboradorId,
                    Rol = rol,
                    FechaAsignacion = DateTime.UtcNow,
                    Activo = true
                };

                await _context.CuadrillaColaboradores.AddAsync(asignacion);
                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> DesasignarColaboradorAsync(int cuadrillaId, int colaboradorId)
        {
            try
            {
                var asignacion = await _context.CuadrillaColaboradores
                    .FirstOrDefaultAsync(cc => cc.CuadrillaId == cuadrillaId && 
                                              cc.ColaboradorId == colaboradorId && 
                                              cc.Activo);

                if (asignacion == null)
                    return false;

                asignacion.Activo = false;
                asignacion.FechaDesasignacion = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<IEnumerable<Colaborador>> GetColaboradoresByCuadrillaAsync(int cuadrillaId)
        {
            return await _context.CuadrillaColaboradores
                .Where(cc => cc.CuadrillaId == cuadrillaId && cc.Activo)
                .Include(cc => cc.Colaborador)
                .Select(cc => cc.Colaborador)
                .ToListAsync();
        }

        public async Task<int> GetCapacidadDisponibleAsync(int cuadrillaId)
        {
            var cuadrilla = await GetByIdAsync(cuadrillaId);
            if (cuadrilla == null)
                return 0;

            var colaboradoresActivos = await _context.CuadrillaColaboradores
                .CountAsync(cc => cc.CuadrillaId == cuadrillaId && cc.Activo);

            return cuadrilla.CapacidadMaxima - colaboradoresActivos;
        }
    }
}