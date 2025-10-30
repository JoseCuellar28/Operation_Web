using OperationWeb.DataAccess.Entities;

namespace OperationWeb.Business.Services
{
    public interface IEmpleadoService
    {
        Task<IEnumerable<Empleado>> GetAllEmpleadosAsync();
        Task<Empleado?> GetEmpleadoByIdAsync(int id);
        Task<Empleado> CreateEmpleadoAsync(Empleado empleado);
        Task<Empleado> UpdateEmpleadoAsync(Empleado empleado);
        Task<bool> DeleteEmpleadoAsync(int id);
        Task<bool> ValidateUniqueDocumentoAsync(string numeroDocumento, int? excludeId = null);
        Task<bool> ValidateUniqueEmailAsync(string email, int? excludeId = null);
        Task<bool> ValidateUniqueCodigoEmpleadoAsync(string codigoEmpleado, int? excludeId = null);
        Task<IEnumerable<Empleado>> GetEmpleadosByEmpresaAsync(int idEmpresa);
        Task<IEnumerable<Empleado>> GetEmpleadosActivosAsync();
    }
}