using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OperationWeb.DataAccess.Entities
{
    [Table("Proyectos")]
    public class Proyecto
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Nombre { get; set; } = string.Empty; // Mapped from Personal.Area
        
        [MaxLength(100)]
        public string? Division { get; set; }

        [MaxLength(200)]
        public string? Cliente { get; set; }

        [StringLength(50)]
        public string Estado { get; set; } = "Activo"; // Activo, Pausa, Cerrado

        public DateTime? FechaInicio { get; set; }

        public DateTime? FechaFin { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? Presupuesto { get; set; }

        public DateTime? FechaSincronizacion { get; set; } // Timestamp of last sync

        [MaxLength(20)]
        public string? GerenteDni { get; set; }

        [MaxLength(20)]
        public string? JefeDni { get; set; }
    }
}
