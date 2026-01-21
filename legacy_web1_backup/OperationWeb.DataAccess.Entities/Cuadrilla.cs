using System.ComponentModel.DataAnnotations;

namespace OperationWeb.DataAccess.Entities
{
    public class Cuadrilla
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Descripcion { get; set; }

        [Required]
        [StringLength(50)]
        public string Estado { get; set; } = "Activa";

        [Required]
        public int CapacidadMaxima { get; set; }

        [StringLength(100)]
        public string? Supervisor { get; set; }

        [StringLength(200)]
        public string? Ubicacion { get; set; }

        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        public DateTime? FechaModificacion { get; set; }

        // Navegación a colaboradores
        public virtual ICollection<CuadrillaColaborador> CuadrillaColaboradores { get; set; } = new List<CuadrillaColaborador>();
    }
}