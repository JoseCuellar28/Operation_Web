using OperationWeb.DataAccess.Entities;
using OperationWeb.DataAccess.Repositories;

namespace OperationWeb.Business.Services
{
    public class EmpleadoService : IEmpleadoService
    {
        private readonly IEmpleadoRepository _empleadoRepository;

        public EmpleadoService(IEmpleadoRepository empleadoRepository)
        {
            _empleadoRepository = empleadoRepository;
        }

        public async Task<IEnumerable<Empleado>> GetAllEmpleadosAsync()
        {
            return await _empleadoRepository.GetAllAsync();
        }

        public async Task<Empleado?> GetEmpleadoByIdAsync(int id)
        {
            return await _empleadoRepository.GetByIdAsync(id);
        }

        public async Task<Empleado> CreateEmpleadoAsync(Empleado empleado)
        {
            // Validaciones de negocio
            await ValidateEmpleadoAsync(empleado);

            return await _empleadoRepository.CreateAsync(empleado);
        }

        public async Task<Empleado> UpdateEmpleadoAsync(Empleado empleado)
        {
            // Validaciones de negocio
            await ValidateEmpleadoAsync(empleado, empleado.IdEmpleado);

            return await _empleadoRepository.UpdateAsync(empleado);
        }

        public async Task<bool> DeleteEmpleadoAsync(int id)
        {
            var empleado = await _empleadoRepository.GetByIdAsync(id);
            if (empleado == null)
                throw new ArgumentException("El empleado no existe");

            return await _empleadoRepository.DeleteAsync(id);
        }

        public async Task<bool> ValidateUniqueDocumentoAsync(string numeroDocumento, int? excludeId = null)
        {
            if (string.IsNullOrWhiteSpace(numeroDocumento))
                return true;

            return !await _empleadoRepository.ExistsDocumentoAsync(numeroDocumento, excludeId);
        }

        public async Task<bool> ValidateUniqueEmailAsync(string email, int? excludeId = null)
        {
            if (string.IsNullOrWhiteSpace(email))
                return true;

            return !await _empleadoRepository.ExistsEmailAsync(email, excludeId);
        }

        public async Task<bool> ValidateUniqueCodigoEmpleadoAsync(string codigoEmpleado, int? excludeId = null)
        {
            if (string.IsNullOrWhiteSpace(codigoEmpleado))
                return true;

            return !await _empleadoRepository.ExistsCodigoEmpleadoAsync(codigoEmpleado, excludeId);
        }

        public async Task<IEnumerable<Empleado>> GetEmpleadosByEmpresaAsync(int idEmpresa)
        {
            return await _empleadoRepository.GetByEmpresaAsync(idEmpresa);
        }

        public async Task<IEnumerable<Empleado>> GetEmpleadosActivosAsync()
        {
            return await _empleadoRepository.GetActivosAsync();
        }

        private async Task ValidateEmpleadoAsync(Empleado empleado, int? excludeId = null)
        {
            // Validar nombre requerido
            if (string.IsNullOrWhiteSpace(empleado.Nombre))
                throw new ArgumentException("El nombre es requerido");

            // Validar documento único
            if (!string.IsNullOrWhiteSpace(empleado.NumeroDocumento))
            {
                var isDocumentoUnique = await ValidateUniqueDocumentoAsync(empleado.NumeroDocumento, excludeId);
                if (!isDocumentoUnique)
                    throw new ArgumentException("Ya existe un empleado con este número de documento");
            }

            // Validar email único
            if (!string.IsNullOrWhiteSpace(empleado.Email))
            {
                var isEmailUnique = await ValidateUniqueEmailAsync(empleado.Email, excludeId);
                if (!isEmailUnique)
                    throw new ArgumentException("Ya existe un empleado con este email");

                // Validar formato de email
                if (!IsValidEmail(empleado.Email))
                    throw new ArgumentException("El formato del email no es válido");
            }

            // Validar código empleado único
            if (!string.IsNullOrWhiteSpace(empleado.CodigoEmpleado))
            {
                var isCodigoUnique = await ValidateUniqueCodigoEmpleadoAsync(empleado.CodigoEmpleado, excludeId);
                if (!isCodigoUnique)
                    throw new ArgumentException("Ya existe un empleado con este código");
            }
        }

        private static bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }
    }
}