using Microsoft.EntityFrameworkCore;
using OperationWeb.Core.Entities;
using OperationWeb.Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OperationWeb.DataAccess.Repositories
{
    public class ProyectoRepository : Repository<Proyecto>, IProyectoRepository
    {
        public OperationWebDbContext _dbContext;

        public ProyectoRepository(OperationWebDbContext context) : base(context)
        {
            _dbContext = context;
        }

        public async Task<IEnumerable<Proyecto>> GetActiveProjectsAsync()
        {
            return await _context.Proyectos
                .Where(p => p.Estado == "ACTIVO" || p.Estado == "Activo")
                .ToListAsync();
        }

         public async Task<int> SyncFromPersonalAsync()
        {
            // Logic: Insert distinctive Areas from Personal as new Projects
            // ADAPTIVE SQL: Physical table only has Nombre, Estado (No Codigo, No FechaInicio/Creacion)
            var sql = @"
                INSERT INTO Proyectos (Nombre, Estado)
                SELECT DISTINCT Area, 'ACTIVO'
                FROM Personal
                WHERE Area IS NOT NULL 
                AND Area != ''
                AND Area NOT IN (SELECT Nombre FROM Proyectos)";
                
            return await _dbContext.Database.ExecuteSqlRawAsync(sql);
        }

        public async Task<IEnumerable<OperationWeb.Core.DTOs.ProyectoDTO>> GetAllProyectosAsync()
        {
            return await _context.Proyectos
                .Select(p => new OperationWeb.Core.DTOs.ProyectoDTO
                {
                    Id = p.Id,
                    Nombre = p.Nombre,
                    Estado = p.Estado,
                    Cliente = p.Cliente,
                    FechaInicio = p.FechaInicio,
                    FechaFin = p.FechaFin,
                    Division = p.Division,
                    GerenteDni = p.GerenteDni,
                    JefeDni = p.JefeDni
                })
                .ToListAsync();
        }
    }
}
