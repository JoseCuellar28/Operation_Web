using Microsoft.AspNetCore.Http;
using OperationWeb.Business.Interfaces;
using System.Security.Claims;

namespace OperationWeb.Business.Services
{
    public class UserContextService : IUserContextService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UserContextService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public string? GetUserDni() => _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                                    ?? _httpContextAccessor.HttpContext?.User?.FindFirst("sub")?.Value;

        public string? GetUserRole() => _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Role)?.Value;

        public string? GetUserDivision() => _httpContextAccessor.HttpContext?.User?.FindFirst("Division")?.Value;

        public string? GetUserArea() => _httpContextAccessor.HttpContext?.User?.FindFirst("Area")?.Value;

        public string? GetUserLevel() => _httpContextAccessor.HttpContext?.User?.FindFirst("Level")?.Value;
    }
}
