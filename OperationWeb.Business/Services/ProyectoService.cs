using Microsoft.EntityFrameworkCore;
using OperationWeb.Business.Interfaces;
using OperationWeb.DataAccess;
using OperationWeb.DataAccess.Entities;

namespace OperationWeb.Business.Services
{
    public class ProyectoService : IProyectoService
    {
        private readonly OperationWebDbContext _context;

        public ProyectoService(OperationWebDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Proyecto>> GetAllProyectosAsync()
        {
            return await _context.Proyectos
                .OrderBy(p => p.Nombre)
                .ToListAsync();
        }

        public async Task<int> SincronizarProyectosDesdePersonalAsync()
        {
            // 1. Get Stats per Area (Active Employees)
            var areasStats = await _context.Personal
                .Where(p => !string.IsNullOrEmpty(p.Area))
                .GroupBy(p => p.Area)
                .Select(g => new 
                { 
                    Area = g.Key, 
                    Division = g.Max(p => p.Division), // Take one division (Max/Min doesn't matter much if consistent)
                    ActiveCount = g.Count(p => p.FechaCese == null || p.FechaCese > DateTime.Now)
                })
                .ToListAsync();

            var areasDict = areasStats.ToDictionary(x => x.Area, x => x);

            // 2. Get existing Projects
            var proyectosExistentes = await _context.Proyectos.ToListAsync();
            int changesCount = 0;

            // 3. Update Existing Projects
            foreach (var proyecto in proyectosExistentes)
            {
                if (areasDict.TryGetValue(proyecto.Nombre, out var stats))
                {
                    // Determine Status based on Active Employees
                    string nuevoEstado = stats.ActiveCount > 0 ? "Activo" : "Inactivo";
                    
                    if (proyecto.Estado != nuevoEstado)
                    {
                        proyecto.Estado = nuevoEstado;
                        proyecto.FechaSincronizacion = DateTime.UtcNow;
                        changesCount++;
                    }
                }
                else
                {
                    // Project exists but no employees found in Personal (maybe all deleted?)
                    // Mark as Inactive if not already
                    if (proyecto.Estado != "Inactivo")
                    {
                        proyecto.Estado = "Inactivo";
                        proyecto.FechaSincronizacion = DateTime.UtcNow;
                        changesCount++;
                    }
                }
            }

            // 4. Create New Projects
            var existingNames = proyectosExistentes.Select(p => p.Nombre).ToHashSet();
            var newAreas = areasStats.Where(x => !existingNames.Contains(x.Area)).ToList();

            if (newAreas.Any())
            {
                var nuevosProyectos = newAreas.Select(stats => new Proyecto
                {
                    Nombre = stats.Area,
                    Division = stats.Division,
                    Estado = stats.ActiveCount > 0 ? "Activo" : "Inactivo",
                    FechaSincronizacion = DateTime.UtcNow
                });

                await _context.Proyectos.AddRangeAsync(nuevosProyectos);
                changesCount += newAreas.Count;
            }

            // 5. Save Changes
            if (changesCount > 0)
            {
                await _context.SaveChangesAsync();
            }

            return changesCount;
        }
        public async Task AsignarLideresAsync(int proyectoId, string? gerenteDni, string? jefeDni)
        {
            var proyecto = await _context.Proyectos.FindAsync(proyectoId);
            if (proyecto == null)
            {
                throw new KeyNotFoundException($"Proyecto con ID {proyectoId} no encontrado.");
            }

            proyecto.GerenteDni = gerenteDni;
            proyecto.JefeDni = jefeDni;
            proyecto.FechaSincronizacion = DateTime.UtcNow; // Update sync timestamp to reflect change

            await _context.SaveChangesAsync();
        }
    }
}
