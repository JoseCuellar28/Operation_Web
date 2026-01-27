using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OperationWeb.Core.Entities
{
    [Table("Proyectos")]
    public class Proyecto
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public required string Nombre { get; set; }

        [MaxLength(200)]
        public string? Cliente { get; set; }

        [Required]
        [MaxLength(50)]
        public required string Estado { get; set; }

        public DateTime? FechaInicio { get; set; }

        public DateTime? FechaFin { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? Presupuesto { get; set; }

        public DateTime? FechaSincronizacion { get; set; }

        [MaxLength(100)]
        public string? Division { get; set; }

        [MaxLength(80)]
        public string? GerenteDni { get; set; }

        [MaxLength(80)]
        public string? JefeDni { get; set; }
    }
}
