using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OperationWeb.Core.Entities
{
    [Table("Dispositivos_Vinculados")]
    public class DispositivoVinculado
    {
        [Key]
        [Column("id_dispositivo")]
        public int IdDispositivo { get; set; }

        [Column("id_colaborador")]
        public int IdColaborador { get; set; }

        [Column("imei_hash")]
        [StringLength(255)]
        public string? ImeiHash { get; set; }

        [Column("uuid_hash")]
        [StringLength(255)]
        public string? UuidHash { get; set; }

        [Column("fecha_registro")]
        public DateTime FechaRegistro { get; set; }

        [Column("activo")]
        public bool Activo { get; set; }
    }
}
