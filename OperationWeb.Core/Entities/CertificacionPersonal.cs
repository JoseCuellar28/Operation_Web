using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OperationWeb.Core.Entities
{
    [Table("Certificaciones_Personal")]
    public class CertificacionPersonal
    {
        [Key]
        [Column("id_cert")]
        public int IdCert { get; set; }

        [Column("id_colaborador")]
        public int IdColaborador { get; set; }

        [Column("tipo_curso")]
        [StringLength(150)]
        public string TipoCurso { get; set; } = string.Empty;

        [Column("fecha_vencimiento")]
        public DateTime FechaVencimiento { get; set; }

        [Column("estado_vigencia")]
        [StringLength(30)]
        public string EstadoVigencia { get; set; } = "vigente";
    }
}
