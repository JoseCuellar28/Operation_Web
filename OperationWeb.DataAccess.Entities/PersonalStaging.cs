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
    }
}
