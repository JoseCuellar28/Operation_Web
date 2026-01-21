using Microsoft.EntityFrameworkCore;
using OperationWeb.Core.Entities;
using OperationWeb.Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OperationWeb.DataAccess.Repositories
{
    public class PersonalRepository : Repository<Personal>, IPersonalRepository
    {
        private readonly OperaMainDbContext _operaMainContext;

        public PersonalRepository(OperationWebDbContext context, OperaMainDbContext operaMainContext) : base(context)
        {
            _operaMainContext = operaMainContext;
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
                    var users = await _context.Users.Where(u => u.DNI == dni).ToListAsync();
                    if (users.Any()) _context.Users.RemoveRange(users);
                    
                    // Cleanup staging
                    var staging = await _context.PersonalStaging.Where(p => p.DNI == dni).ToListAsync();
                    if (staging.Any()) _context.PersonalStaging.RemoveRange(staging);

                    _dbSet.Remove(entity);
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DELETE ERROR] {ex.Message}");
                throw;
            }
        }

        public async Task<IEnumerable<(Personal Personal, User? User)>> GetAllWithUserStatusAsync()
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
             var divisions = await _context.Personal.Where(p => !string.IsNullOrEmpty(p.Area)).Select(p => p.Area).Distinct().OrderBy(x => x).ToListAsync();
             var areas = await _context.Personal.Where(p => !string.IsNullOrEmpty(p.DetalleCebe)).Select(p => p.DetalleCebe).Distinct().OrderBy(x => x).ToListAsync();
             var categories = await _context.Personal.Where(p => !string.IsNullOrEmpty(p.Tipo)).Select(p => p.Tipo).Distinct().OrderBy(x => x).ToListAsync();
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
                var colabor = await _operaMainContext.Colaboradores.FirstOrDefaultAsync(e => e.DNI == personal.DNI);
                
                if (colabor == null)
                {
                    colabor = new ColaboradorMain
                    {
                        DNI = personal.DNI,
                        Nombre = personal.Inspector ?? "Sin Nombre",
                        Rol = personal.Tipo,
                        Telefono = personal.Telefono,
                        PhotoUrl = personal.FotoUrl,
                        EstadoOperativo = personal.Estado,
                        Active = personal.Estado != "Cesado",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    await _operaMainContext.Colaboradores.AddAsync(colabor);
                }
                else
                {
                    colabor.Nombre = personal.Inspector ?? colabor.Nombre;
                    colabor.Rol = personal.Tipo ?? colabor.Rol;
                    colabor.Telefono = personal.Telefono ?? colabor.Telefono;
                    colabor.PhotoUrl = personal.FotoUrl ?? colabor.PhotoUrl;
                    colabor.EstadoOperativo = personal.Estado ?? colabor.EstadoOperativo;
                    colabor.Active = personal.Estado != "Cesado";
                    colabor.UpdatedAt = DateTime.UtcNow;
                }

                await _operaMainContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SYNC ERROR] Failed to sync {personal.DNI} to Opera_Main: {ex.Message}");
            }
        }
    }
}
