using System.ComponentModel.DataAnnotations;

namespace OperationWeb.DataAccess.Entities
{
    public class CuadrillaColaborador
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int CuadrillaId { get; set; }

        [Required]
        public int ColaboradorId { get; set; }

        public DateTime FechaAsignacion { get; set; } = DateTime.UtcNow;

        public DateTime? FechaDesasignacion { get; set; }

        [StringLength(50)]
        public string? Rol { get; set; }

        [Required]
        public bool Activo { get; set; } = true;

        // Navegación
        public virtual Cuadrilla Cuadrilla { get; set; } = null!;
        public virtual Colaborador Colaborador { get; set; } = null!;
    }
}