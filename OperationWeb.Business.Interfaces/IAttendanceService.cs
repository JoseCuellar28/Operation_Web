using System.Threading.Tasks;

namespace OperationWeb.Business.Interfaces
{
    public interface IAttendanceService
    {
        Task<(bool Success, string Message, string Status)> CheckInAsync(string dni, double lat, double lng, string address, bool isHealthOk);
        Task<System.Collections.Generic.List<OperationWeb.Business.Interfaces.DTOs.AttendanceRecordDto>> GetAttendanceAsync(string date);
        Task<bool> SyncWhatsappAsync(string id, bool sync, string? syncDate);
        Task<bool> ResolveAlertAsync(string id, string action);
        Task<(bool Success, string Message)> SeedAttendanceAsync();
        Task<(bool Success, string Message, int Count)> FixAddressesAsync();
    }
}
