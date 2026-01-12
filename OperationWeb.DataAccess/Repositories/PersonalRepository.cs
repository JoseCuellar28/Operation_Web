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
        public async Task<IEnumerable<(Entities.Personal Personal, Entities.User User)>> GetAllWithUserStatusAsync()
        {
            var query = from p in _context.Personal
                        join u in _context.Users on p.DNI equals u.DNI into userGroup
                        from u in userGroup.DefaultIfEmpty()
                        select new { Personal = p, User = u };

            var result = await query.ToListAsync();
            return result.Select(x => (x.Personal, x.User));
        }

        public async Task<(IEnumerable<string> Divisions, IEnumerable<string> Areas, IEnumerable<string> Categories)> GetMetadataAsync()
        {
            // UI 'Unidad' maps to DB 'Area'
            var divisions = await _context.Personal
                .Where(p => !string.IsNullOrEmpty(p.Area))
                .Select(p => p.Area)
                .Distinct()
                .OrderBy(x => x)
                .ToListAsync();

            // UI 'Area' maps to DB 'DetalleCebe'
            var areas = await _context.Personal
                .Where(p => !string.IsNullOrEmpty(p.DetalleCebe))
                .Select(p => p.DetalleCebe)
                .Distinct()
                .OrderBy(x => x)
                .ToListAsync();

            // UI 'Puesto/Posicion' maps to DB 'Tipo'
            var categories = await _context.Personal
                .Where(p => !string.IsNullOrEmpty(p.Tipo))
                .Select(p => p.Tipo)
                .Distinct()
                .OrderBy(x => x)
                .ToListAsync();

            return (divisions!, areas!, categories!);
        }

        public async Task<HistorialCargaPersonal> RegisterLoadHistoryAsync(HistorialCargaPersonal history)
        {
            await _context.Set<HistorialCargaPersonal>().AddAsync(history);
            await _context.SaveChangesAsync();
            return history;
        }

        public async Task SyncToColaboradoresAsync(Personal personal)
        {
            try 
            {
                // NOTA: Requiere permisos de cross-database o que Opera_Main esté accesible via sinonimo/linked server
                var sql = @"
                    MERGE INTO Opera_Main.dbo.COLABORADORES AS Target
                    USING (SELECT {0} as dni) AS Source
                    ON (Target.dni = Source.dni)
                    WHEN MATCHED THEN
                        UPDATE SET
                            Target.nombre = {1},
                            Target.rol = {2},
                            Target.phone = {3},
                            Target.photo_url = {4},
                            Target.estado_operativo = {5},
                            Target.active = CASE WHEN {5} = 'Cesado' THEN 0 ELSE 1 END,
                            Target.updated_at = GETDATE()
                    WHEN NOT MATCHED BY TARGET THEN
                        INSERT (dni, nombre, rol, phone, photo_url, estado_operativo, active, created_at, updated_at)
                        VALUES ({0}, {1}, {2}, {3}, {4}, {5}, CASE WHEN {5} = 'Cesado' THEN 0 ELSE 1 END, GETDATE(), GETDATE());
                ";

                // Map 'Estado' to 'estado_operativo' logic
                var estadoOp = personal.Estado == "Cesado" ? "Retirado" : personal.Estado;

                await _context.Database.ExecuteSqlRawAsync(sql, 
                    personal.DNI, 
                    personal.Inspector ?? "", 
                    personal.Tipo ?? "", 
                    personal.Telefono ?? "", 
                    personal.FotoUrl ?? "", 
                    estadoOp ?? ""
                );
            }
            catch (Exception ex)
            {
                // Log failure but don't stop flow
                Console.WriteLine($"[SYNC ERROR] Failed to sync {personal.DNI} to COLABORADORES: {ex.Message}");
            }
        }
    }
}
