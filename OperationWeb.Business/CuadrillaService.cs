using OperationWeb.Business.Interfaces;
using OperationWeb.Core.Entities;
using OperationWeb.Core.Interfaces;

namespace OperationWeb.Business
{
    public class CuadrillaService : ICuadrillaService
    {
        private readonly ICuadrillaRepository _cuadrillaRepository;
        private readonly IPersonalRepository _personalRepository;

        public CuadrillaService(ICuadrillaRepository cuadrillaRepository, IPersonalRepository personalRepository)
        {
            _cuadrillaRepository = cuadrillaRepository;
            _personalRepository = personalRepository;
        }

        public async Task<IEnumerable<Cuadrilla>> GetAllCuadrillasAsync()
        {
            return await _cuadrillaRepository.GetAllAsync();
        }

        public async Task<Cuadrilla?> GetCuadrillaByIdAsync(int id)
        {
            return await _cuadrillaRepository.GetByIdAsync(id);
        }

        public async Task<Cuadrilla?> GetCuadrillaWithPersonalAsync(int id)
        {
            return await _cuadrillaRepository.GetCuadrillaWithPersonalAsync(id);
        }

        public async Task<IEnumerable<Cuadrilla>> GetCuadrillasByEstadoAsync(string estado)
        {
            return await _cuadrillaRepository.GetCuadrillasByEstadoAsync(estado);
        }

        public async Task<Cuadrilla> CreateCuadrillaAsync(Cuadrilla cuadrilla)
        {
            // Validaciones de negocio
            if (string.IsNullOrWhiteSpace(cuadrilla.Nombre))
                throw new ArgumentException("El nombre de la cuadrilla es requerido");

            if (cuadrilla.CapacidadMaxima <= 0)
                throw new ArgumentException("La capacidad máxima debe ser mayor a 0");

            // Verificar que el nombre sea único
            var cuadrillasExistentes = await _cuadrillaRepository.FindAsync(c => c.Nombre == cuadrilla.Nombre);
            if (cuadrillasExistentes.Any())
                throw new InvalidOperationException("Ya existe una cuadrilla con ese nombre");

            cuadrilla.FechaCreacion = DateTime.UtcNow;
            cuadrilla.Estado = string.IsNullOrWhiteSpace(cuadrilla.Estado) ? "Activa" : cuadrilla.Estado;

            return await _cuadrillaRepository.AddAsync(cuadrilla);
        }

        public async Task<Cuadrilla> UpdateCuadrillaAsync(Cuadrilla cuadrilla)
        {
            // Validaciones de negocio
            if (string.IsNullOrWhiteSpace(cuadrilla.Nombre))
                throw new ArgumentException("El nombre de la cuadrilla es requerido");

            if (cuadrilla.CapacidadMaxima <= 0)
                throw new ArgumentException("La capacidad máxima debe ser mayor a 0");

            // Verificar que existe
            var cuadrillaExistente = await _cuadrillaRepository.GetByIdAsync(cuadrilla.Id);
            if (cuadrillaExistente == null)
                throw new InvalidOperationException("La cuadrilla no existe");

            // Verificar que el nombre sea único (excluyendo la cuadrilla actual)
            var cuadrillasConMismoNombre = await _cuadrillaRepository.FindAsync(c => c.Nombre == cuadrilla.Nombre && c.Id != cuadrilla.Id);
            if (cuadrillasConMismoNombre.Any())
                throw new InvalidOperationException("Ya existe otra cuadrilla con ese nombre");

            // Verificar que la nueva capacidad no sea menor a los colaboradores actuales
            var personalActual = await _cuadrillaRepository.GetPersonalByCuadrillaAsync(cuadrilla.Id);
            if (cuadrilla.CapacidadMaxima < personalActual.Count())
                throw new InvalidOperationException($"La capacidad máxima no puede ser menor al personal actual ({personalActual.Count()})");

            cuadrilla.FechaModificacion = DateTime.UtcNow;
            return await _cuadrillaRepository.UpdateAsync(cuadrilla);
        }

        public async Task<bool> DeleteCuadrillaAsync(int id)
        {
            var cuadrilla = await _cuadrillaRepository.GetByIdAsync(id);
            if (cuadrilla == null)
                return false;

            // Verificar que no tenga colaboradores asignados
            var personal = await _cuadrillaRepository.GetPersonalByCuadrillaAsync(id);
            if (personal.Any())
                throw new InvalidOperationException("No se puede eliminar una cuadrilla con personal asignado");

            await _cuadrillaRepository.DeleteAsync(id);
            return true;
        }

        public async Task<bool> AsignarPersonalAsync(int cuadrillaId, string personalDNI, string? rol = null)
        {
            // Validar que la cuadrilla existe y está activa
            var cuadrilla = await _cuadrillaRepository.GetByIdAsync(cuadrillaId);
            if (cuadrilla == null || cuadrilla.Estado != "Activa")
                return false;

            // Validar que el personal existe
            var personal = await _personalRepository.GetByDNIAsync(personalDNI);
            if (personal == null)
                return false;

            // Validar capacidad disponible
            var capacidadDisponible = await _cuadrillaRepository.GetCapacidadDisponibleAsync(cuadrillaId);
            if (capacidadDisponible <= 0)
                return false;

            return await _cuadrillaRepository.AsignarPersonalAsync(cuadrillaId, personalDNI, rol);
        }

        public async Task<bool> DesasignarPersonalAsync(int cuadrillaId, string personalDNI)
        {
            return await _cuadrillaRepository.DesasignarPersonalAsync(cuadrillaId, personalDNI);
        }

        public async Task<IEnumerable<Personal>> GetPersonalByCuadrillaAsync(int cuadrillaId)
        {
            return await _cuadrillaRepository.GetPersonalByCuadrillaAsync(cuadrillaId);
        }

        public async Task<bool> ValidarCapacidadCuadrillaAsync(int cuadrillaId)
        {
            var capacidadDisponible = await _cuadrillaRepository.GetCapacidadDisponibleAsync(cuadrillaId);
            return capacidadDisponible > 0;
        }

        public async Task<int> GetCapacidadDisponibleAsync(int cuadrillaId)
        {
            return await _cuadrillaRepository.GetCapacidadDisponibleAsync(cuadrillaId);
        }
    }
}