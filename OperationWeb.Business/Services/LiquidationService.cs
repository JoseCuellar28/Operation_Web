using OperationWeb.Business.DTOs;
using OperationWeb.Business.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OperationWeb.Business.Services
{
    public class LiquidationService : ILiquidationService
    {
        // MOCK DATA STORAGE
        private static readonly List<LiquidationDto> _mockData = new()
        {
            new LiquidationDto { OtCode = "OT-2024-001", Proyecto = "Mantenimiento Linea 1", EstadoPago = "PENDIENTE", IsClosed = false, MontoTotal = 1500.00m, MontoPagado = 0m, FechaUltimoPago = null },
            new LiquidationDto { OtCode = "OT-2024-002", Proyecto = "Ampliación Norte", EstadoPago = "PARCIAL", IsClosed = false, MontoTotal = 5000.00m, MontoPagado = 2500.00m, FechaUltimoPago = DateTime.Today.AddDays(-2) },
            new LiquidationDto { OtCode = "OT-2024-003", Proyecto = "Reparación Emergencia", EstadoPago = "PAGADO", IsClosed = true, MontoTotal = 800.00m, MontoPagado = 800.00m, FechaCierre = DateTime.Today.AddDays(-5), FechaUltimoPago = DateTime.Today.AddDays(-5) }
        };

        public Task<IEnumerable<LiquidationDto>> GetPendingLiquidationsAsync()
        {
            // Simulate DB delay
            return Task.FromResult<IEnumerable<LiquidationDto>>(_mockData.Where(x => x.EstadoPago != "PAGADO" || !x.IsClosed));
        }

        public Task<LiquidationDto?> GetLiquidationByOtAsync(string otCode)
        {
            var item = _mockData.FirstOrDefault(x => x.OtCode == otCode);
            return Task.FromResult(item);
        }
    }
}
