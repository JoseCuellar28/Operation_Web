using Microsoft.EntityFrameworkCore;
using OperationWeb.DataAccess.Entities;

namespace OperationWeb.DataAccess.Repositories
{
    public class EmpleadoRepository : IEmpleadoRepository
    {
        private readonly OperationWebDbContext _context;

        public EmpleadoRepository(OperationWebDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Empleado>> GetAllAsync()
        {
            return await _context.Empleados
                .OrderBy(e => e.Nombre)
                .ThenBy(e => e.ApellidoPaterno)
                .ToListAsync();
        }

        public async Task<Empleado?> GetByIdAsync(int id)
        {
            return await _context.Empleados
                .FirstOrDefaultAsync(e => e.IdEmpleado == id);
        }

        public async Task<Empleado?> GetByDocumentoAsync(string numeroDocumento)
        {
            return await _context.Empleados
                .FirstOrDefaultAsync(e => e.NumeroDocumento == numeroDocumento);
        }

        public async Task<Empleado?> GetByEmailAsync(string email)
        {
            return await _context.Empleados
                .FirstOrDefaultAsync(e => e.Email == email);
        }

        public async Task<Empleado?> GetByCodigoEmpleadoAsync(string codigoEmpleado)
        {
            return await _context.Empleados
                .FirstOrDefaultAsync(e => e.CodigoEmpleado == codigoEmpleado);
        }

        public async Task<Empleado> CreateAsync(Empleado empleado)
        {
            empleado.FechaCreacion = DateTime.UtcNow;
            empleado.UsuarioActivo = empleado.UsuarioActivo ?? "S";
            
            _context.Empleados.Add(empleado);
            await _context.SaveChangesAsync();
            return empleado;
        }

        public async Task<Empleado> UpdateAsync(Empleado empleado)
        {
            empleado.FechaModificacion = DateTime.UtcNow;
            
            _context.Entry(empleado).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return empleado;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var empleado = await GetByIdAsync(id);
            if (empleado == null)
                return false;

            // Soft delete - marcar como inactivo
            empleado.UsuarioActivo = "N";
            empleado.FechaModificacion = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsDocumentoAsync(string numeroDocumento, int? excludeId = null)
        {
            var query = _context.Empleados.Where(e => e.NumeroDocumento == numeroDocumento);
            
            if (excludeId.HasValue)
                query = query.Where(e => e.IdEmpleado != excludeId.Value);
                
            return await query.AnyAsync();
        }

        public async Task<bool> ExistsEmailAsync(string email, int? excludeId = null)
        {
            var query = _context.Empleados.Where(e => e.Email == email);
            
            if (excludeId.HasValue)
                query = query.Where(e => e.IdEmpleado != excludeId.Value);
                
            return await query.AnyAsync();
        }

        public async Task<bool> ExistsCodigoEmpleadoAsync(string codigoEmpleado, int? excludeId = null)
        {
            var query = _context.Empleados.Where(e => e.CodigoEmpleado == codigoEmpleado);
            
            if (excludeId.HasValue)
                query = query.Where(e => e.IdEmpleado != excludeId.Value);
                
            return await query.AnyAsync();
        }

        public async Task<IEnumerable<Empleado>> GetByEmpresaAsync(int idEmpresa)
        {
            return await _context.Empleados
                .Where(e => e.IdEmpresa == idEmpresa)
                .OrderBy(e => e.Nombre)
                .ThenBy(e => e.ApellidoPaterno)
                .ToListAsync();
        }

        public async Task<IEnumerable<Empleado>> GetActivosAsync()
        {
            return await _context.Empleados
                .Where(e => e.UsuarioActivo == "S")
                .OrderBy(e => e.Nombre)
                .ThenBy(e => e.ApellidoPaterno)
                .ToListAsync();
        }
    }
}