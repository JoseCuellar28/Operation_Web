using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OperationWeb.Core.Entities
{
    [Table("Personal")]
    public class Personal
    {
        [Key]
        [StringLength(80)]
        public string DNI { get; set; } = string.Empty;

        [StringLength(100)]
        public string? Inspector { get; set; }

        [StringLength(20)]
        public string? Telefono { get; set; }

        [StringLength(100)]
        public string? Distrito { get; set; }

        [StringLength(80)]
        public string? Tipo { get; set; }

        [StringLength(50)]
        public string? Estado { get; set; }

        [StringLength(500)]
        public string? FotoUrl { get; set; }

        [StringLength(500)]
        public string? FirmaUrl { get; set; }

        public DateTime? FechaInicio { get; set; }

        public DateTime? FechaCese { get; set; }

        [StringLength(100)]
        public string? UsuarioCreacion { get; set; }

        public DateTime? FechaCreacion { get; set; }

        public DateTime? FechaModificacion { get; set; }

        [StringLength(100)]
        public string? UsuarioModificacion { get; set; }

        // Nuevos campos sincronizados con Excel
        [StringLength(20)]
        public string? CodigoEmpleado { get; set; }

        [StringLength(100)]
        public string? Categoria { get; set; }

        [StringLength(100)]
        public string? Division { get; set; }

        [StringLength(100)]
        public string? LineaNegocio { get; set; }

        [StringLength(100)]
        public string? Area { get; set; }

        [StringLength(100)]
        public string? Seccion { get; set; }

        [StringLength(200)]
        public string? DetalleCebe { get; set; }

        [StringLength(50)]
        public string? CodigoCebe { get; set; }

        [StringLength(200)]
        public string? MotivoCeseDesc { get; set; }

        [StringLength(500)]
        public string? Comentario { get; set; }

        public DateTime? FechaNacimiento { get; set; }

        [StringLength(20)]
        public string? Sexo { get; set; }

        public int? Edad { get; set; }

        public decimal? Permanencia { get; set; }

        [StringLength(100)]
        public string? Email { get; set; }

        [StringLength(100)]
        public string? EmailPersonal { get; set; }

        [StringLength(200)]
        public string? JefeInmediato { get; set; }

        [NotMapped]
        public string? Foto { get; set; } // Base64 from FE

        [NotMapped]
        public string? Firma { get; set; } // Base64 from FE
    }
}
