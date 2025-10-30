using OperationWeb.Business.Interfaces;
using OperationWeb.DataAccess.Entities;
using OperationWeb.DataAccess.Interfaces;

namespace OperationWeb.Business
{
    public class CuadrillaService : ICuadrillaService
    {
        private readonly ICuadrillaRepository _cuadrillaRepository;
        private readonly IColaboradorRepository _colaboradorRepository;

        public CuadrillaService(ICuadrillaRepository cuadrillaRepository, IColaboradorRepository colaboradorRepository)
        {
            _cuadrillaRepository = cuadrillaRepository;
            _colaboradorRepository = colaboradorRepository;
        }

        public async Task<IEnumerable<Cuadrilla>> GetAllCuadrillasAsync()
        {
            return await _cuadrillaRepository.GetAllAsync();
        }

        public async Task<Cuadrilla?> GetCuadrillaByIdAsync(int id)
        {
            return await _cuadrillaRepository.GetByIdAsync(id);
        }

        public async Task<Cuadrilla?> GetCuadrillaWithColaboradoresAsync(int id)
        {
            return await _cuadrillaRepository.GetCuadrillaWithColaboradoresAsync(id);
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
            var colaboradoresActuales = await _cuadrillaRepository.GetColaboradoresByCuadrillaAsync(cuadrilla.Id);
            if (cuadrilla.CapacidadMaxima < colaboradoresActuales.Count())
                throw new InvalidOperationException($"La capacidad máxima no puede ser menor a los colaboradores actuales ({colaboradoresActuales.Count()})");

            cuadrilla.FechaModificacion = DateTime.UtcNow;
            return await _cuadrillaRepository.UpdateAsync(cuadrilla);
        }

        public async Task<bool> DeleteCuadrillaAsync(int id)
        {
            var cuadrilla = await _cuadrillaRepository.GetByIdAsync(id);
            if (cuadrilla == null)
                return false;

            // Verificar que no tenga colaboradores asignados
            var colaboradores = await _cuadrillaRepository.GetColaboradoresByCuadrillaAsync(id);
            if (colaboradores.Any())
                throw new InvalidOperationException("No se puede eliminar una cuadrilla con colaboradores asignados");

            await _cuadrillaRepository.DeleteAsync(id);
            return true;
        }

        public async Task<bool> AsignarColaboradorAsync(int cuadrillaId, int colaboradorId, string? rol = null)
        {
            // Validar que la cuadrilla existe y está activa
            var cuadrilla = await _cuadrillaRepository.GetByIdAsync(cuadrillaId);
            if (cuadrilla == null || cuadrilla.Estado != "Activa")
                return false;

            // Validar que el colaborador existe y está activo
            var colaborador = await _colaboradorRepository.GetByIdAsync(colaboradorId);
            if (colaborador == null || colaborador.Estado != "Activo")
                return false;

            // Validar capacidad disponible
            var capacidadDisponible = await _cuadrillaRepository.GetCapacidadDisponibleAsync(cuadrillaId);
            if (capacidadDisponible <= 0)
                return false;

            return await _cuadrillaRepository.AsignarColaboradorAsync(cuadrillaId, colaboradorId, rol);
        }

        public async Task<bool> DesasignarColaboradorAsync(int cuadrillaId, int colaboradorId)
        {
            return await _cuadrillaRepository.DesasignarColaboradorAsync(cuadrillaId, colaboradorId);
        }

        public async Task<IEnumerable<Colaborador>> GetColaboradoresByCuadrillaAsync(int cuadrillaId)
        {
            return await _cuadrillaRepository.GetColaboradoresByCuadrillaAsync(cuadrillaId);
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