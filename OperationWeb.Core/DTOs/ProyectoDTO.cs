using System;

namespace OperationWeb.Core.DTOs
{
    public class ProyectoDTO
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Estado { get; set; }
    }
}
