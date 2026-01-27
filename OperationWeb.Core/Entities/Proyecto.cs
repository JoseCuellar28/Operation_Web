using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System;

namespace OperationWeb.Core.Entities
{
    [Table("Proyectos")]
    public class Proyecto
    {
        [Key]
        public int Id { get; set; }

        [StringLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [StringLength(20)] // Note: Map says 50, but let's be safe or update to 50? Map says 50.
        public string? Estado { get; set; }

        [StringLength(200)]
        public string? Cliente { get; set; }

        public DateTime? FechaInicio { get; set; }
        public DateTime? FechaFin { get; set; }
        
        public decimal? Presupuesto { get; set; }

        public DateTime? FechaSincronizacion { get; set; }

        [StringLength(100)]
        public string? Division { get; set; }

        [StringLength(80)]
        public string? GerenteDni { get; set; }

        [StringLength(80)]
        public string? JefeDni { get; set; }
    }
}
