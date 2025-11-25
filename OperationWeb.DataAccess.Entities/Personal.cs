using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OperationWeb.DataAccess.Entities
{
    [Table("Personal")]
    public class Personal
    {
        [Key]
        [StringLength(40)]
        public string DNI { get; set; } = string.Empty;

        [StringLength(100)]
        public string? Inspector { get; set; }

        [StringLength(20)]
        public string? Telefono { get; set; }

        [StringLength(100)]
        public string? Distrito { get; set; }

        [StringLength(40)]
        public string? Tipo { get; set; }

        public DateTime? FechaInicio { get; set; }

        public DateTime? FechaCese { get; set; }

        [StringLength(100)]
        public string? UsuarioCreacion { get; set; }

        public DateTime? FechaCreacion { get; set; }

        public DateTime? FechaModificacion { get; set; }

        [StringLength(100)]
        public string? UsuarioModificacion { get; set; }
    }
}
