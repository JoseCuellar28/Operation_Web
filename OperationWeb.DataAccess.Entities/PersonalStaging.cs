using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OperationWeb.DataAccess.Entities
{
    [Table("Personal_Staging")]
    public class PersonalStaging
    {
        [Key]
        public int Id { get; set; }

        [StringLength(40)]
        public string? DNI { get; set; }

        [StringLength(520)]
        public string? Archivo { get; set; }

        [StringLength(200)]
        public string? Hoja { get; set; }

        [StringLength(20)]
        public string? Periodo { get; set; }

        [StringLength(400)]
        public string? Inspector { get; set; }

        [StringLength(100)]
        public string? Situacion { get; set; }

        public DateTime? FechaIngreso { get; set; }

        public DateTime? FechaCese { get; set; }

        public int? MotivoDeCese { get; set; }

        [StringLength(100)]
        public string? MotivoNorm { get; set; }

        [StringLength(100)]
        public string? SedeTrabajo { get; set; }

        [StringLength(100)]
        public string? TipoTrabajador { get; set; }

        public DateTime? FechaCarga { get; set; }

        [StringLength(100)]
        public string? UsuarioCarga { get; set; }

        [ForeignKey(nameof(DNI))]
        public Personal? Personal { get; set; }

        [ForeignKey(nameof(MotivoDeCese))]
        public MotivoCese? MotivoCeseNavigation { get; set; }

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
    }
}
