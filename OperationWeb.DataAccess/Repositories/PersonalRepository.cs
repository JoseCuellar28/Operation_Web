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
                    // Cleanup Security
                    var users = await _context.Users.Where(u => u.DNI == dni).ToListAsync();
                    
                    var resetTokens = await _context.PasswordResetTokens.Where(t => t.DNI == dni).ToListAsync();
                    if (resetTokens.Any()) _context.PasswordResetTokens.RemoveRange(resetTokens);

                    // UserActivations are Cascade via UserId, but explicit cleanup is safer if Users deletion fails or order matters
                    // However, we delete Users below which triggers Cascade for UserActivations if configured.
                    // Let's rely on Cascade for UserActivations (as per DB Context) but ensure PasswordResetToken (No FK) is gone.
                    
                    if (users.Any())
                    {
                        _context.Users.RemoveRange(users);
                        await _context.SaveChangesAsync(); // Critical: break FK_Users_Personal_DNI
                    }
                    
                    // Cleanup Process
                    var staging = await _context.PersonalStaging.Where(p => p.DNI == dni).ToListAsync();
                    if (staging.Any()) _context.PersonalStaging.RemoveRange(staging);

                    var eventos = await _context.PersonalEventosLaborales.Where(e => e.DNI == dni).ToListAsync();
                    if (eventos.Any()) _context.PersonalEventosLaborales.RemoveRange(eventos);

                    var proyectos = await _context.PersonalProyectos.Where(p => p.DNI == dni).ToListAsync();
                    if (proyectos.Any()) _context.PersonalProyectos.RemoveRange(proyectos);

                    // Note: AsistenciasDiarias removed from cleanup due to Error 208 (Invalid object name)
                    // and likely residing in a different database/context.

                    // HSE Cleanup (Inspector, Reporter, Worker, Recipient)
                    var inspections = await _context.HseInspections.Where(i => i.InspectorDNI == dni).ToListAsync();
                    if (inspections.Any()) _context.HseInspections.RemoveRange(inspections);

                    var incidents = await _context.HseIncidents.Where(i => i.ReporterDNI == dni).ToListAsync();
                    if (incidents.Any()) _context.HseIncidents.RemoveRange(incidents);

                    var ppeDeliveries = await _context.HsePpeDeliveries.Where(p => p.DelivererDNI == dni || p.WorkerDNI == dni).ToListAsync();
                    if (ppeDeliveries.Any()) _context.HsePpeDeliveries.RemoveRange(ppeDeliveries);

                    // Note: CuadrillaColaborador is Cascade in DB/EF
                    
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
