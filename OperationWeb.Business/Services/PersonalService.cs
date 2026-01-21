using OperationWeb.Business.Interfaces;
using OperationWeb.Core.Entities;
using OperationWeb.Core.Interfaces;
using OperationWeb.Business.DTOs;

namespace OperationWeb.Business.Services
{
    public class PersonalService : IPersonalService
    {
        private readonly IPersonalRepository _personalRepository;
        private readonly IRepository<PersonalEventoLaboral> _eventoRepository;
        private readonly IRepository<HistorialCargaPersonal> _historialRepository;

        public PersonalService(IPersonalRepository personalRepository, IRepository<PersonalEventoLaboral> eventoRepository, IRepository<HistorialCargaPersonal> historialRepository)
        {
            _personalRepository = personalRepository;
            _eventoRepository = eventoRepository;
            _historialRepository = historialRepository;
        }

        public async Task<IEnumerable<Personal>> GetAllAsync()
        {
            return await _personalRepository.GetAllAsync();
        }

        public async Task<Personal?> GetByDniAsync(string dni)
        {
            return await _personalRepository.GetByDNIAsync(dni);
        }

        public async Task<Personal> CreateAsync(Personal personal)
        {
            var existing = await _personalRepository.GetByDNIAsync(personal.DNI);
            if (existing != null)
                throw new ArgumentException($"El personal con DNI {personal.DNI} ya existe.");

            personal.FechaCreacion = DateTime.UtcNow;
            
            // Core: Persist in Master Table (DB_Operation.Personal)
            var created = await _personalRepository.AddAsync(personal);

            // Sync: Replicate to Slave Table (Opera_Main.Colaboradores)
            await _personalRepository.SyncToColaboradoresAsync(created);

            await LogEventoAsync(created.DNI, "Alta", "Creación de nuevo colaborador (Core)");
            return created;
        }

        public async Task<Personal> UpdateAsync(Personal personal)
        {
            var existing = await _personalRepository.GetByDNIAsync(personal.DNI);
            if (existing == null)
                throw new ArgumentException($"No se encontró personal con DNI {personal.DNI}.");

            // Update properties
            existing.Inspector = personal.Inspector;
            existing.Telefono = personal.Telefono;
            existing.Distrito = personal.Distrito;
            existing.Tipo = personal.Tipo;
            existing.Estado = personal.Estado; // Actualiza estado operativo
            existing.FechaInicio = personal.FechaInicio;
            existing.FechaCese = personal.FechaCese;
            existing.FechaNacimiento = personal.FechaNacimiento; // NEW
            
            // Only update URLs if provided (controller sets them from logic)
            if (!string.IsNullOrEmpty(personal.FotoUrl)) existing.FotoUrl = personal.FotoUrl;
            if (!string.IsNullOrEmpty(personal.FirmaUrl)) existing.FirmaUrl = personal.FirmaUrl;

            existing.CodigoEmpleado = personal.CodigoEmpleado;
            existing.Division = personal.Division;
            existing.Area = personal.Area;
            existing.Email = personal.Email;
            existing.CodigoCebe = personal.CodigoCebe;
            existing.UsuarioModificacion = personal.UsuarioModificacion;
            existing.FechaModificacion = DateTime.UtcNow;

            await _personalRepository.UpdateAsync(existing);
            
            // Sync Update
            await _personalRepository.SyncToColaboradoresAsync(existing);

            await LogEventoAsync(existing.DNI, "Cambio", "Actualización de datos (Core)");
            return existing;
        }

        public async Task<bool> DeleteAsync(string dni)
        {
            var existing = await _personalRepository.GetByDNIAsync(dni);
            if (existing == null) return false;

            await _personalRepository.DeleteByDNIAsync(dni);
            // Sync Delete? Usually soft delete is preferred. 
            // The logic in Repository handles cascading deletes for internal tables.
            // For Opera_Main, we might want to set Active=false.
            // But strict delete was requested.
            return true;
        }

        public async Task<IEnumerable<PersonalWithUserStatusDto>> GetAllWithUserStatusAsync()
        {
            // Use specialized repository method returning (Personal, User)
            var data = await _personalRepository.GetAllWithUserStatusAsync();
            
            return data.Select(x => new PersonalWithUserStatusDto
            {
                DNI = x.Personal.DNI,
                Inspector = x.Personal.Inspector,
                Telefono = x.Personal.Telefono,
                Distrito = x.Personal.Distrito,
                Tipo = x.Personal.Tipo, 
                Estado = x.Personal.Estado,
                FechaInicio = x.Personal.FechaInicio,
                FechaCese = x.Personal.FechaCese,
                UsuarioCreacion = x.Personal.UsuarioCreacion,
                FechaCreacion = x.Personal.FechaCreacion,
                FechaModificacion = x.Personal.FechaModificacion,
                UsuarioModificacion = x.Personal.UsuarioModificacion,
                FechaNacimiento = x.Personal.FechaNacimiento, // NEW
                FotoUrl = x.Personal.FotoUrl, // NEW
                FirmaUrl = x.Personal.FirmaUrl, // NEW
                CodigoEmpleado = x.Personal.CodigoEmpleado,
                Division = x.Personal.Division,
                Area = x.Personal.Area,
                CodigoCebe = x.Personal.CodigoCebe,
                Email = x.Personal.Email,
                HasUser = x.User != null,
                UserIsActive = x.User != null && x.User.IsActive
            });
        }

        public async Task<bool> TerminateAsync(string dni)
        {
            var personal = await _personalRepository.GetByDNIAsync(dni);
            if (personal == null) return false;

            personal.FechaCese = DateTime.UtcNow;
            personal.Estado = "Cesado"; 
            
            await _personalRepository.UpdateAsync(personal);
            await _personalRepository.SyncToColaboradoresAsync(personal); // Sync status change

            await LogEventoAsync(dni, "Baja", "Cese administrativo (Core)");
            return true;
        }

        public async Task<HistorialCargaPersonal> RegisterLoadHistoryAsync(HistorialCargaPersonal history)
        {
            // Delegate to repository
            return await _personalRepository.RegisterLoadHistoryAsync(history);
        }

        public async Task<PersonalMetadataDto> GetMetadataAsync()
        {
            var (divs, areas, roles) = await _personalRepository.GetMetadataAsync();
            return new PersonalMetadataDto
            {
                Divisiones = divs,
                Areas = areas,
                Cargos = roles
            };
        }

        private async Task LogEventoAsync(string dni, string tipoEvento, string motivo)
        {
            try
            {
                var evento = new PersonalEventoLaboral
                {
                    DNI = dni,
                    TipoEvento = tipoEvento,
                    Motivo = motivo,
                    FechaEvento = DateTime.UtcNow,
                    Periodo = DateTime.UtcNow.ToString("yyyyMM")
                };
                await _eventoRepository.AddAsync(evento);
            }
            catch (Exception) { /* Silent */ }
        }
    }
}
