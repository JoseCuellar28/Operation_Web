using System;

namespace OperationWeb.Core.DTOs
{
    public class ProyectoDTO
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Estado { get; set; }
        
        // Extended Mapping (Master Data)
        public string? Cliente { get; set; }
        public DateTime? FechaInicio { get; set; }
        public DateTime? FechaFin { get; set; }
        public string? Division { get; set; }
        public string? GerenteDni { get; set; }
        public string? JefeDni { get; set; }
    }
}
