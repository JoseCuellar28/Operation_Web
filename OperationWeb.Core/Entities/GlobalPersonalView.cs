using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OperationWeb.Core.Entities
{
    [Table("v_Global_Personal")]
    public class GlobalPersonalView
    {
        [Column("dni")]
        [StringLength(80)]
        public string DNI { get; set; } = string.Empty;

        [Column("nombre_completo")]
        public string? NombreCompleto { get; set; }

        [Column("cargo")]
        public string? Cargo { get; set; }

        [Column("area")]
        public string? Area { get; set; }

        [Column("division")]
        public string? Division { get; set; }

        [Column("sede")]
        public string? Sede { get; set; }

        [Column("estado")]
        public string? Estado { get; set; }

        [Column("email")]
        public string? Email { get; set; }
    }
}
