using OperationWeb.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OperationWeb.Core.Interfaces
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

        // Refactor Hardening: Support for Personal Endpoint
        Task<IEnumerable<(Empleado Empleado, User? User)>> GetAllWithUserStatusAsync();
        Task<(IEnumerable<string> Divisions, IEnumerable<string> Areas, IEnumerable<string> Roles)> GetMetadataAsync();
    }
}
