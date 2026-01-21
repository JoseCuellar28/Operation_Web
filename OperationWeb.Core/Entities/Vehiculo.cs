using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OperationWeb.Core.Entities
{
    // No Table attribute needed as we map manually via SQL
    public class Vehiculo
    {
        [Key]
        [Column("placa")]
        public string Placa { get; set; }

        [Column("marca")]
        public string Marca { get; set; }

        [Column("tipo_activo")]
        public string TipoActivo { get; set; }

        [Column("max_volumen")]
        public string MaxVolumen { get; set; }

        [Column("estado")]
        public string Estado { get; set; }

        [Column("ultimo_km_registrado")]
        public int? UltimoKmRegistrado { get; set; }

        [Column("proximo_mant_km")]
        public int? ProximoMantKm { get; set; }
    }
}
