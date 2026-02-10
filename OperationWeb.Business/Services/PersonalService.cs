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

            // Sync: Replicate handled by SQL Trigger


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
            
            // Sync Update handled by SQL Trigger


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

        public async Task<bool> TerminateAsync(string dni, DateTime fechaCese, string? motivo)
        {
            var personal = await _personalRepository.GetByDNIAsync(dni);
            if (personal == null) return false;

            personal.FechaCese = fechaCese;
            personal.Estado = "Cesado"; 
            personal.MotivoCeseDesc = motivo;
            
            await _personalRepository.UpdateAsync(personal);
            await _personalRepository.UpdateAsync(personal);


            await LogEventoAsync(dni, "Baja", $"Cese administrativo: {motivo}");
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
        public async Task SyncAllAsync()
        {
            var allPersonal = await _personalRepository.GetAllAsync();
            // Deprecated: Sync handled by SQL Trigger
        }

        public async Task<BulkImportResultDto> BulkImportAsync(List<PersonalImportDto> employees, string usuario)
        {
            var result = new BulkImportResultDto();
            var errors = new List<string>();

            foreach (var emp in employees)
            {
                try
                {
                    // Validar DNI requerido
                    if (string.IsNullOrWhiteSpace(emp.DNI))
                    {
                        errors.Add($"Fila sin DNI: {emp.Trabajador ?? "Desconocido"}");
                        result.Failed++;
                        continue;
                    }

                    var existing = await _personalRepository.GetByDNIAsync(emp.DNI);

                    if (existing == null)
                    {
                        // CREATE: Nuevo colaborador
                        var personal = MapToPersonal(emp, usuario);
                        var created = await _personalRepository.AddAsync(personal);
                        await LogEventoAsync(created.DNI, "Alta", "Otro");
                        result.Created++;
                    }
                    else
                    {
                        // UPDATE: Colaborador existente - Merge inteligente
                        bool hasChanges = MergeChanges(existing, emp, usuario);
                        
                        if (hasChanges)
                        {
                            await _personalRepository.UpdateAsync(existing);
                            await LogEventoAsync(existing.DNI, "Cambio", "Otro");

                            result.Updated++;
                        }
                        else
                        {
                            result.Unchanged++;
                        }
                    }
                }
                catch (Exception ex)
                {
                    errors.Add($"DNI {emp.DNI}: {ex.Message}");
                    result.Failed++;
                }
            }

            // Registrar historial de carga
            try
            {
                await RegisterLoadHistoryAsync(new HistorialCargaPersonal
                {
                    Usuario = usuario,
                    FechaCarga = DateTime.UtcNow,
                    FilasProcesadas = result.Created + result.Updated + result.Unchanged + result.Failed,
                    InsertadosSnapshot = result.Created,
                    ActualizadosSnapshot = result.Updated
                });
            }
            catch { /* Silent */ }

            result.Errors = errors;
            result.Message = $"Proceso completado: {result.Created} creados, {result.Updated} actualizados, {result.Unchanged} sin cambios, {result.Failed} fallidos";
            
            return result;
        }

        private Personal MapToPersonal(PersonalImportDto dto, string usuario)
        {
            return new Personal
            {
                // Identificación
                DNI = dto.DNI,
                CodigoEmpleado = dto.CodigoSAP,
                
                // Datos personales
                Inspector = dto.Trabajador,
                FechaNacimiento = dto.FechaNacimiento,
                Sexo = dto.Sexo,
                Edad = dto.Edad,
                
                // Organización
                Categoria = dto.Categoria,
                Tipo = dto.Cargo,
                Division = dto.Division,
                LineaNegocio = dto.LineaNegocio,
                Area = dto.AreaProyecto,
                Seccion = dto.SeccionServicio,
                DetalleCebe = dto.DetalleCebe,
                CodigoCebe = dto.CodigoCebe,
                
                // Estado laboral - CRÍTICO: Detección automática basada en FechaCese
                Estado = dto.FechaCese.HasValue ? "CESADO" : "ACTIVO",
                FechaInicio = dto.FechaIngreso,
                FechaCese = dto.FechaCese,
                MotivoCeseDesc = dto.MotivoCese,
                Permanencia = dto.Permanencia,
                
                // Contacto
                Email = dto.CorreoCorporativo,
                EmailPersonal = dto.CorreoPersonal,
                Telefono = dto.Telefono,
                
                // Otros
                Distrito = dto.SedeTrabajo,
                JefeInmediato = dto.JefeInmediato,
                Comentario = dto.Comentario,
                
                // Auditoría
                UsuarioCreacion = usuario,
                FechaCreacion = DateTime.UtcNow
            };
        }

        private bool MergeChanges(Personal existing, PersonalImportDto dto, string usuario)
        {
            bool hasChanges = false;

            // Solo actualizar si el valor nuevo es diferente y no nulo/vacío
            if (!string.IsNullOrWhiteSpace(dto.CodigoSAP) && existing.CodigoEmpleado != dto.CodigoSAP)
            {
                existing.CodigoEmpleado = dto.CodigoSAP;
                hasChanges = true;
            }

            if (!string.IsNullOrWhiteSpace(dto.Trabajador) && existing.Inspector != dto.Trabajador)
            {
                existing.Inspector = dto.Trabajador;
                hasChanges = true;
            }

            if (dto.FechaNacimiento.HasValue && existing.FechaNacimiento != dto.FechaNacimiento)
            {
                existing.FechaNacimiento = dto.FechaNacimiento;
                hasChanges = true;
            }

            if (!string.IsNullOrWhiteSpace(dto.Sexo) && existing.Sexo != dto.Sexo)
            {
                existing.Sexo = dto.Sexo;
                hasChanges = true;
            }

            if (dto.Edad.HasValue && existing.Edad != dto.Edad)
            {
                existing.Edad = dto.Edad;
                hasChanges = true;
            }

            if (!string.IsNullOrWhiteSpace(dto.Categoria) && existing.Categoria != dto.Categoria)
            {
                existing.Categoria = dto.Categoria;
                hasChanges = true;
            }

            if (!string.IsNullOrWhiteSpace(dto.Cargo) && existing.Tipo != dto.Cargo)
            {
                existing.Tipo = dto.Cargo;
                hasChanges = true;
            }

            if (!string.IsNullOrWhiteSpace(dto.Division) && existing.Division != dto.Division)
            {
                existing.Division = dto.Division;
                hasChanges = true;
            }

            if (!string.IsNullOrWhiteSpace(dto.LineaNegocio) && existing.LineaNegocio != dto.LineaNegocio)
            {
                existing.LineaNegocio = dto.LineaNegocio;
                hasChanges = true;
            }

            if (!string.IsNullOrWhiteSpace(dto.AreaProyecto) && existing.Area != dto.AreaProyecto)
            {
                existing.Area = dto.AreaProyecto;
                hasChanges = true;
            }

            if (!string.IsNullOrWhiteSpace(dto.SeccionServicio) && existing.Seccion != dto.SeccionServicio)
            {
                existing.Seccion = dto.SeccionServicio;
                hasChanges = true;
            }

            if (!string.IsNullOrWhiteSpace(dto.DetalleCebe) && existing.DetalleCebe != dto.DetalleCebe)
            {
                existing.DetalleCebe = dto.DetalleCebe;
                hasChanges = true;
            }

            if (!string.IsNullOrWhiteSpace(dto.CodigoCebe) && existing.CodigoCebe != dto.CodigoCebe)
            {
                existing.CodigoCebe = dto.CodigoCebe;
                hasChanges = true;
            }

            if (dto.FechaIngreso.HasValue && existing.FechaInicio != dto.FechaIngreso)
            {
                existing.FechaInicio = dto.FechaIngreso;
                hasChanges = true;
            }

            // Estado especial: SIEMPRE actualizar basado en FechaCese
            var nuevoEstado = dto.FechaCese.HasValue ? "CESADO" : "ACTIVO";
            if (existing.Estado != nuevoEstado || existing.FechaCese != dto.FechaCese)
            {
                existing.Estado = nuevoEstado;
                existing.FechaCese = dto.FechaCese;
                existing.MotivoCeseDesc = dto.MotivoCese;
                hasChanges = true;
            }

            if (dto.Permanencia.HasValue && existing.Permanencia != dto.Permanencia)
            {
                existing.Permanencia = dto.Permanencia;
                hasChanges = true;
            }

            if (!string.IsNullOrWhiteSpace(dto.CorreoCorporativo) && existing.Email != dto.CorreoCorporativo)
            {
                existing.Email = dto.CorreoCorporativo;
                hasChanges = true;
            }

            if (!string.IsNullOrWhiteSpace(dto.CorreoPersonal) && existing.EmailPersonal != dto.CorreoPersonal)
            {
                existing.EmailPersonal = dto.CorreoPersonal;
                hasChanges = true;
            }

            if (!string.IsNullOrWhiteSpace(dto.Telefono) && existing.Telefono != dto.Telefono)
            {
                existing.Telefono = dto.Telefono;
                hasChanges = true;
            }

            if (!string.IsNullOrWhiteSpace(dto.SedeTrabajo) && existing.Distrito != dto.SedeTrabajo)
            {
                existing.Distrito = dto.SedeTrabajo;
                hasChanges = true;
            }

            if (!string.IsNullOrWhiteSpace(dto.JefeInmediato) && existing.JefeInmediato != dto.JefeInmediato)
            {
                existing.JefeInmediato = dto.JefeInmediato;
                hasChanges = true;
            }

            if (!string.IsNullOrWhiteSpace(dto.Comentario) && existing.Comentario != dto.Comentario)
            {
                existing.Comentario = dto.Comentario;
                hasChanges = true;
            }

            if (hasChanges)
            {
                existing.UsuarioModificacion = usuario;
                existing.FechaModificacion = DateTime.UtcNow;
            }

            return hasChanges;
        }
    }
}
