using OperationWeb.Business.Interfaces;
using OperationWeb.DataAccess.Entities;
using OperationWeb.DataAccess.Interfaces;

namespace OperationWeb.Business
{
    public class ColaboradorService : IColaboradorService
    {
        private readonly IColaboradorRepository _colaboradorRepository;

        public ColaboradorService(IColaboradorRepository colaboradorRepository)
        {
            _colaboradorRepository = colaboradorRepository;
        }

        public async Task<IEnumerable<Colaborador>> GetAllColaboradoresAsync()
        {
            return await _colaboradorRepository.GetAllAsync();
        }

        public async Task<Colaborador?> GetColaboradorByIdAsync(int id)
        {
            return await _colaboradorRepository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<Colaborador>> GetColaboradoresByEstadoAsync(string estado)
        {
            return await _colaboradorRepository.GetColaboradoresByEstadoAsync(estado);
        }

        public async Task<IEnumerable<Colaborador>> GetColaboradoresByCargoAsync(string cargo)
        {
            return await _colaboradorRepository.GetColaboradoresByCargoAsync(cargo);
        }

        public async Task<IEnumerable<Colaborador>> GetColaboradoresDisponiblesAsync()
        {
            return await _colaboradorRepository.GetColaboradoresDisponiblesAsync();
        }

        public async Task<Colaborador> CreateColaboradorAsync(Colaborador colaborador)
        {
            // Validaciones de negocio
            if (string.IsNullOrWhiteSpace(colaborador.Nombre))
                throw new ArgumentException("El nombre es requerido");

            if (string.IsNullOrWhiteSpace(colaborador.Apellido))
                throw new ArgumentException("El apellido es requerido");

            if (string.IsNullOrWhiteSpace(colaborador.Cargo))
                throw new ArgumentException("El cargo es requerido");

            // Validar documento único
            if (!string.IsNullOrWhiteSpace(colaborador.Documento))
            {
                var documentoExiste = await ValidarDocumentoUnicoAsync(colaborador.Documento);
                if (!documentoExiste)
                    throw new InvalidOperationException("Ya existe un colaborador con ese documento");
            }

            // Validar email único
            if (!string.IsNullOrWhiteSpace(colaborador.Email))
            {
                var emailExiste = await ValidarEmailUnicoAsync(colaborador.Email);
                if (!emailExiste)
                    throw new InvalidOperationException("Ya existe un colaborador con ese email");
            }

            colaborador.FechaIngreso = DateTime.UtcNow;
            colaborador.Estado = string.IsNullOrWhiteSpace(colaborador.Estado) ? "Activo" : colaborador.Estado;

            return await _colaboradorRepository.AddAsync(colaborador);
        }

        public async Task<Colaborador> UpdateColaboradorAsync(Colaborador colaborador)
        {
            // Validaciones de negocio
            if (string.IsNullOrWhiteSpace(colaborador.Nombre))
                throw new ArgumentException("El nombre es requerido");

            if (string.IsNullOrWhiteSpace(colaborador.Apellido))
                throw new ArgumentException("El apellido es requerido");

            if (string.IsNullOrWhiteSpace(colaborador.Cargo))
                throw new ArgumentException("El cargo es requerido");

            // Verificar que existe
            var colaboradorExistente = await _colaboradorRepository.GetByIdAsync(colaborador.Id);
            if (colaboradorExistente == null)
                throw new InvalidOperationException("El colaborador no existe");

            // Validar documento único (excluyendo el colaborador actual)
            if (!string.IsNullOrWhiteSpace(colaborador.Documento))
            {
                var documentoExiste = await ValidarDocumentoUnicoAsync(colaborador.Documento, colaborador.Id);
                if (!documentoExiste)
                    throw new InvalidOperationException("Ya existe otro colaborador con ese documento");
            }

            // Validar email único (excluyendo el colaborador actual)
            if (!string.IsNullOrWhiteSpace(colaborador.Email))
            {
                var emailExiste = await ValidarEmailUnicoAsync(colaborador.Email, colaborador.Id);
                if (!emailExiste)
                    throw new InvalidOperationException("Ya existe otro colaborador con ese email");
            }

            return await _colaboradorRepository.UpdateAsync(colaborador);
        }

        public async Task<bool> DeleteColaboradorAsync(int id)
        {
            var colaborador = await _colaboradorRepository.GetByIdAsync(id);
            if (colaborador == null)
                return false;

            // Verificar que no esté asignado a ninguna cuadrilla activa
            var cuadrillas = await _colaboradorRepository.GetCuadrillasByColaboradorAsync(id);
            if (cuadrillas.Any())
                throw new InvalidOperationException("No se puede eliminar un colaborador asignado a cuadrillas activas");

            await _colaboradorRepository.DeleteAsync(id);
            return true;
        }

        public async Task<IEnumerable<Cuadrilla>> GetCuadrillasByColaboradorAsync(int colaboradorId)
        {
            return await _colaboradorRepository.GetCuadrillasByColaboradorAsync(colaboradorId);
        }

        public async Task<bool> ValidarDocumentoUnicoAsync(string documento, int? colaboradorId = null)
        {
            var colaboradorExistente = await _colaboradorRepository.GetByDocumentoAsync(documento);
            
            if (colaboradorExistente == null)
                return true;

            // Si se proporciona un ID, verificar que no sea el mismo colaborador
            if (colaboradorId.HasValue && colaboradorExistente.Id == colaboradorId.Value)
                return true;

            return false;
        }

        public async Task<bool> ValidarEmailUnicoAsync(string email, int? colaboradorId = null)
        {
            var colaboradorExistente = await _colaboradorRepository.GetByEmailAsync(email);
            
            if (colaboradorExistente == null)
                return true;

            // Si se proporciona un ID, verificar que no sea el mismo colaborador
            if (colaboradorId.HasValue && colaboradorExistente.Id == colaboradorId.Value)
                return true;

            return false;
        }
    }
}