using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OperationWeb.Core.Entities
{
    [Table("Zonas_Trabajo")]
    public class ZonaTrabajo
    {
        [Key]
        [Column("id_zona")]
        public int IdZona { get; set; }

        [Column("nombre_zona")]
        [StringLength(150)]
        public string NombreZona { get; set; } = string.Empty;

        [Column("latitud_centro")]
        public decimal LatitudCentro { get; set; }

        [Column("longitud_centro")]
        public decimal LongitudCentro { get; set; }

        [Column("radio_metros")]
        public int RadioMetros { get; set; } = 500;

        [Column("activo")]
        public bool Activo { get; set; } = true;
    }
}
