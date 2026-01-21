using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OperationWeb.Core.Entities
{
    [Table("Personal_EventoLaboral")]
    public class PersonalEventoLaboral
    {
        [Key]
        public int Id { get; set; }

        [StringLength(40)]
        public string? DNI { get; set; }

        [StringLength(40)]
        public string? TipoEvento { get; set; }

        [StringLength(100)]
        public string? Motivo { get; set; }

        public DateTime? FechaEvento { get; set; }

        [StringLength(20)]
        public string? Periodo { get; set; }

        [ForeignKey(nameof(DNI))]
        public Personal? Personal { get; set; }
    }
}
