using OperationWeb.Business.Interfaces;
using OperationWeb.DataAccess.Entities;
using OperationWeb.DataAccess.Interfaces;
using OperationWeb.Business.DTOs;

namespace OperationWeb.Business.Services
{
    public class PersonalService : IPersonalService
    {
        private readonly IPersonalRepository _personalRepository;
        private readonly IRepository<PersonalEventoLaboral> _eventoRepository;

        public PersonalService(IPersonalRepository personalRepository, IRepository<PersonalEventoLaboral> eventoRepository)
        {
            _personalRepository = personalRepository;
            _eventoRepository = eventoRepository;
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
            // Validar si ya existe
            var existing = await _personalRepository.GetByDNIAsync(personal.DNI);
            if (existing != null)
            {
                throw new ArgumentException($"El personal con DNI {personal.DNI} ya existe.");
            }

            personal.FechaCreacion = DateTime.UtcNow;
            var created = await _personalRepository.AddAsync(personal);

            // Log Event: Alta
            await LogEventoAsync(created.DNI, "Alta", "Creación de nuevo colaborador");

            return created;
        }

        public async Task<Personal> UpdateAsync(Personal personal)
        {
            var existing = await _personalRepository.GetByDNIAsync(personal.DNI);
            if (existing == null)
            {
                throw new ArgumentException($"No se encontró personal con DNI {personal.DNI}.");
            }

            // Actualizar campos permitidos
            existing.Inspector = personal.Inspector;
            existing.Telefono = personal.Telefono;
            existing.Distrito = personal.Distrito;
            existing.Tipo = personal.Tipo;
            existing.FechaInicio = personal.FechaInicio;
            existing.FechaCese = personal.FechaCese;
            existing.FechaModificacion = DateTime.UtcNow;
            existing.UsuarioModificacion = personal.UsuarioModificacion;
            existing.Estado = personal.Estado;
            existing.FotoUrl = personal.FotoUrl;
            existing.FirmaUrl = personal.FirmaUrl;
            
            // Nuevos campos
            existing.CodigoEmpleado = personal.CodigoEmpleado;
            existing.Categoria = personal.Categoria;
            existing.Division = personal.Division;
            existing.LineaNegocio = personal.LineaNegocio;
            existing.Area = personal.Area;
            existing.Seccion = personal.Seccion;
            existing.DetalleCebe = personal.DetalleCebe;
            existing.CodigoCebe = personal.CodigoCebe;
            existing.MotivoCeseDesc = personal.MotivoCeseDesc;
            existing.Comentario = personal.Comentario;
            existing.FechaNacimiento = personal.FechaNacimiento;
            existing.Sexo = personal.Sexo;
            existing.Edad = personal.Edad;
            existing.Permanencia = personal.Permanencia;
            existing.Email = personal.Email;
            existing.EmailPersonal = personal.EmailPersonal;
            existing.JefeInmediato = personal.JefeInmediato;

            var updated = await _personalRepository.UpdateAsync(existing);

            // Log Event: Cambio
            await LogEventoAsync(updated.DNI, "Cambio", "Actualización de datos");

            return updated;
        }

        public async Task<bool> DeleteAsync(string dni)
        {
            var existing = await _personalRepository.GetByDNIAsync(dni);
            if (existing == null)
            {
                return false;
            }

            await _personalRepository.DeleteByDNIAsync(dni);
            return true;
        }

        public async Task<IEnumerable<PersonalWithUserStatusDto>> GetAllWithUserStatusAsync()
        {
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
                CodigoEmpleado = x.Personal.CodigoEmpleado,
                Categoria = x.Personal.Categoria,
                Division = x.Personal.Division,
                LineaNegocio = x.Personal.LineaNegocio,
                Area = x.Personal.Area,
                Seccion = x.Personal.Seccion,
                DetalleCebe = x.Personal.DetalleCebe,
                CodigoCebe = x.Personal.CodigoCebe,
                MotivoCeseDesc = x.Personal.MotivoCeseDesc,
                Comentario = x.Personal.Comentario,
                FechaNacimiento = x.Personal.FechaNacimiento,
                Sexo = x.Personal.Sexo,
                Edad = x.Personal.Edad,
                Permanencia = x.Personal.Permanencia,
                Email = x.Personal.Email,
                EmailPersonal = x.Personal.EmailPersonal,
                JefeInmediato = x.Personal.JefeInmediato,
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
            personal.MotivoCeseDesc = "Cese administrativo"; // Default reason, can be updated later

            await _personalRepository.UpdateAsync(personal);

            // Log Event: Baja
            await LogEventoAsync(dni, "Baja", "Cese administrativo");

            return true;
        }

        public async Task<HistorialCargaPersonal> RegisterLoadHistoryAsync(HistorialCargaPersonal history)
        {
            return await _personalRepository.RegisterLoadHistoryAsync(history);
        }

        public async Task<PersonalMetadataDto> GetMetadataAsync()
        {
            var (divs, areas, cats) = await _personalRepository.GetMetadataAsync();
            return new PersonalMetadataDto
            {
                Divisiones = divs,
                Areas = areas,
                Cargos = cats
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
            catch (Exception ex)
            {
                // Silently fail logging to not disrupt main flow, but ideally log to ILogger
                Console.WriteLine($"Error logging event for {dni}: {ex.Message}");
            }
        }

        private async Task SyncToColaboradores(Personal personal)
        {
            await _personalRepository.SyncToColaboradoresAsync(personal);
        }
    }
}
