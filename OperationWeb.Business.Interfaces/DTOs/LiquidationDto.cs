using System;

namespace OperationWeb.Business.DTOs
{
    public class LiquidationDto
    {
        public string OtCode { get; set; } = string.Empty;
        public string Proyecto { get; set; } = string.Empty;
        public string EstadoPago { get; set; } = "PENDIENTE"; // PENDIENTE, PAGADO, EN_PROCESO
        public bool IsClosed { get; set; }
        public decimal MontoTotal { get; set; }
        public decimal MontoPagado { get; set; }
        public DateTime? FechaCierre { get; set; }
        public DateTime? FechaUltimoPago { get; set; }
    }
}
