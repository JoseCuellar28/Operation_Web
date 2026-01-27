using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OperationWeb.Core.Entities
{
    [Table("PersonalProyectos")]
    public class PersonalProyecto
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [MaxLength(40)]
        public required string DNI { get; set; }

        [Required]
        public int ProyectoId { get; set; }

        [ForeignKey("ProyectoId")]
        public virtual Proyecto? Proyecto { get; set; }

        [Required]
        public DateTime FechaAsignacion { get; set; }

        public DateTime? FechaDesasignacion { get; set; }

        [Required]
        public bool EsActivo { get; set; }

        [MaxLength(50)]
        public string? RolEnProyecto { get; set; }

        [Column(TypeName = "decimal(5,4)")]
        public decimal? PorcentajeDedicacion { get; set; }
    }
}
