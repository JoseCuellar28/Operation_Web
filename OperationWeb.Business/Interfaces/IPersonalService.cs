using OperationWeb.Business.DTOs;
using OperationWeb.DataAccess.Entities;

namespace OperationWeb.Business.Interfaces
{
    public interface IPersonalService
    {
        Task<IEnumerable<Personal>> GetAllAsync();
        Task<IEnumerable<PersonalWithUserStatusDto>> GetAllWithUserStatusAsync();
        Task<Personal?> GetByDniAsync(string dni);
        Task<Personal> CreateAsync(Personal personal);
        Task<Personal> UpdateAsync(Personal personal);
        Task<bool> DeleteAsync(string dni);
        Task<bool> TerminateAsync(string dni);
    }
}
