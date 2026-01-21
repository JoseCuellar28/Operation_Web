using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OperationWeb.Core.Entities
{
    public class CuadrillaColaborador
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int CuadrillaId { get; set; }

        [Required]
        [StringLength(40)]
        public string PersonalDNI { get; set; } = string.Empty;

        public DateTime FechaAsignacion { get; set; } = DateTime.UtcNow;

        public DateTime? FechaDesasignacion { get; set; }

        [StringLength(50)]
        public string? Rol { get; set; }

        [Required]
        public bool Activo { get; set; } = true;

        // Navegación
        public virtual Cuadrilla Cuadrilla { get; set; } = null!;
        
        [ForeignKey("PersonalDNI")]
        public virtual Personal Personal { get; set; } = null!;
    }
}