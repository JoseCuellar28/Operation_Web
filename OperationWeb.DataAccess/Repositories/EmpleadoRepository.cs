using Microsoft.EntityFrameworkCore;
using OperationWeb.Core.Entities;
using OperationWeb.Core.Interfaces;

namespace OperationWeb.DataAccess.Repositories
{
    public class EmpleadoRepository : IEmpleadoRepository
    {
        private readonly OperaMainDbContext _context;

        public EmpleadoRepository(OperaMainDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Empleado>> GetAllAsync()
        {
            return await _context.Empleados
                .OrderBy(e => e.Nombre)
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
                .FirstOrDefaultAsync(e => e.DNI == numeroDocumento);
        }

        public async Task<bool> ExistsDocumentoAsync(string numeroDocumento, int? excludeId = null)
        {
            var query = _context.Empleados.Where(e => e.DNI == numeroDocumento);
            
            if (excludeId.HasValue)
                query = query.Where(e => e.IdEmpleado != excludeId.Value);
                
            return await query.AnyAsync();
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
                .ToListAsync();
        }

        public async Task<IEnumerable<Empleado>> GetActivosAsync()
        {
            return await _context.Empleados
                .Where(e => e.UsuarioActivo == "S")
                .OrderBy(e => e.Nombre)
                .ToListAsync();
        }

        public async Task<IEnumerable<(Empleado Empleado, User? User)>> GetAllWithUserStatusAsync()
        {
             var query = from e in _context.Empleados
                        join u in _context.Users on e.DNI equals u.DNI into userGroup
                        from u in userGroup.DefaultIfEmpty()
                        orderby e.Nombre
                        select new { Empleado = e, User = u };

            var result = await query.ToListAsync();
            return result.Select(x => (x.Empleado, x.User));
        }

        public async Task<(IEnumerable<string> Divisions, IEnumerable<string> Areas, IEnumerable<string> Roles)> GetMetadataAsync()
        {
            // UI 'Unidad' maps to Empleado 'Division' (string)
            var divisions = await _context.Empleados
                .Where(p => !string.IsNullOrEmpty(p.Division))
                .Select(p => p.Division!)
                .Distinct()
                .OrderBy(x => x)
                .ToListAsync();

            // UI 'Area' maps to Empleado 'Area' (string)
            var areas = await _context.Empleados
                .Where(p => !string.IsNullOrEmpty(p.Area))
                .Select(p => p.Area!)
                .Distinct()
                .OrderBy(x => x)
                .ToListAsync();

            // UI 'Puesto/Posicion' maps to Empleado 'Rol' (string)
            var roles = await _context.Empleados
                .Where(p => !string.IsNullOrEmpty(p.Rol))
                .Select(p => p.Rol!)
                .Distinct()
                .OrderBy(x => x)
                .ToListAsync();

            return (divisions, areas, roles);
        }
    }
}
