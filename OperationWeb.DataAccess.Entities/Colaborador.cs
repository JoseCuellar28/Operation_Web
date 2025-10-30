using System.ComponentModel.DataAnnotations;

namespace OperationWeb.DataAccess.Entities
{
    public class Colaborador
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Apellido { get; set; } = string.Empty;

        [StringLength(20)]
        public string? Documento { get; set; }

        [StringLength(100)]
        public string? Email { get; set; }

        [StringLength(20)]
        public string? Telefono { get; set; }

        [Required]
        [StringLength(50)]
        public string Cargo { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Estado { get; set; } = "Activo";

        public DateTime FechaIngreso { get; set; } = DateTime.UtcNow;

        public DateTime? FechaSalida { get; set; }

        // Navegación a cuadrillas
        public virtual ICollection<CuadrillaColaborador> CuadrillaColaboradores { get; set; } = new List<CuadrillaColaborador>();
    }
}