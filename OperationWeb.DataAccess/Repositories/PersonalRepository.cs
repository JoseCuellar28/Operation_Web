using Microsoft.EntityFrameworkCore;
using OperationWeb.DataAccess.Entities;
using OperationWeb.DataAccess.Interfaces;

namespace OperationWeb.DataAccess.Repositories
{
    public class PersonalRepository : Repository<Personal>, IPersonalRepository
    {
        public PersonalRepository(OperationWebDbContext context) : base(context)
        {
        }

        public async Task<Personal?> GetByDNIAsync(string dni)
        {
            return await _dbSet.FirstOrDefaultAsync(p => p.DNI == dni);
        }

        public async Task DeleteByDNIAsync(string dni)
        {
            try
            {
                var entity = await GetByDNIAsync(dni);
                if (entity != null)
                {
                    // Manual cascade delete for dependent records
                    var users = await _context.Users.Where(u => u.DNI == dni).ToListAsync();
                    if (users.Any())
                    {
                        var userIds = users.Select(u => u.Id).ToList();
                        
                        var userRoles = await _context.UserRoles.Where(ur => userIds.Contains(ur.UserId)).ToListAsync();
                        if (userRoles.Any()) _context.UserRoles.RemoveRange(userRoles);

                        var userActivations = await _context.UserActivations.Where(ua => userIds.Contains(ua.UserId)).ToListAsync();
                        if (userActivations.Any()) _context.UserActivations.RemoveRange(userActivations);

                        _context.Users.RemoveRange(users);
                    }

                    var staging = await _context.PersonalStaging.Where(p => p.DNI == dni).ToListAsync();
                    if (staging.Any()) _context.PersonalStaging.RemoveRange(staging);

                    var eventos = await _context.PersonalEventosLaborales.Where(e => e.DNI == dni).ToListAsync();
                    if (eventos.Any()) _context.PersonalEventosLaborales.RemoveRange(eventos);

                    var cuadrillas = await _context.CuadrillaColaboradores.Where(c => c.PersonalDNI == dni).ToListAsync();
                    if (cuadrillas.Any()) _context.CuadrillaColaboradores.RemoveRange(cuadrillas);

                    var empleados = await _context.Empleados.Where(e => e.DNI == dni).ToListAsync();
                    if (empleados.Any()) _context.Empleados.RemoveRange(empleados);

                    // Save changes for dependents first to avoid FK violation if EF doesn't know the relationship
                    await _context.SaveChangesAsync();

                    _dbSet.Remove(entity);
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DELETE ERROR] {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"[DELETE INNER ERROR] {ex.InnerException.Message}");
                }
                throw;
            }
        }
        public async Task<IEnumerable<(Personal Personal, User? User)>> GetAllWithUserStatusAsync()
        {
            var query = from p in _context.Personal
                        join u in _context.Users on p.DNI equals u.DNI into userGroup
                        from user in userGroup.DefaultIfEmpty()
                        select new { Personal = p, User = user };

            var result = await query.ToListAsync();
            return result.Select(x => (x.Personal, x.User));
        }
    }
}
