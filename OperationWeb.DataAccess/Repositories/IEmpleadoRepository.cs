using OperationWeb.DataAccess.Entities;

namespace OperationWeb.DataAccess.Repositories
{
    public interface IEmpleadoRepository
    {
        Task<IEnumerable<Empleado>> GetAllAsync();
        Task<Empleado?> GetByIdAsync(int id);
        Task<Empleado?> GetByDocumentoAsync(string numeroDocumento);
        Task<Empleado?> GetByEmailAsync(string email);
        Task<Empleado?> GetByCodigoEmpleadoAsync(string codigoEmpleado);
        Task<Empleado> CreateAsync(Empleado empleado);
        Task<Empleado> UpdateAsync(Empleado empleado);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsDocumentoAsync(string numeroDocumento, int? excludeId = null);
        Task<bool> ExistsEmailAsync(string email, int? excludeId = null);
        Task<bool> ExistsCodigoEmpleadoAsync(string codigoEmpleado, int? excludeId = null);
        Task<IEnumerable<Empleado>> GetByEmpresaAsync(int idEmpresa);
        Task<IEnumerable<Empleado>> GetActivosAsync();
    }
}