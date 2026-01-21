using OperationWeb.Business.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OperationWeb.Business.Interfaces
{
    public interface ILiquidationService
    {
        Task<IEnumerable<LiquidationDto>> GetPendingLiquidationsAsync();
        Task<LiquidationDto?> GetLiquidationByOtAsync(string otCode);
    }
}
