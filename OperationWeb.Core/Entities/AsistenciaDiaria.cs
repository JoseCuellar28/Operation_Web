using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OperationWeb.Core.Entities
{
    [Table("ASISTENCIA_DIARIA")]
    public class AsistenciaDiaria
    {
        [Key]
        [Column("id_registro")]
        [StringLength(50)]
        public string IdRegistro { get; set; } = string.Empty;

        [Column("id_colaborador")]
        public int IdColaborador { get; set; }

        [Column("fecha_asistencia")]
        public DateTime FechaAsistencia { get; set; }

        [Column("hora_checkin")]
        public DateTime? HoraCheckIn { get; set; }

        [Column("lat_checkin")]
        public decimal? LatCheckIn { get; set; }

        [Column("long_checkin")]
        public decimal? LongCheckIn { get; set; }

        [Column("location_address")]
        public string? LocationAddress { get; set; }

        [Column("check_salud_apto")]
        public int? CheckSaludApto { get; set; } 

        [Column("estado_final")]
        [StringLength(50)]
        public string? EstadoFinal { get; set; }

        [Column("whatsapp_sync")]
        public bool WhatsappSync { get; set; }

        [Column("sync_date")]
        public DateTime? SyncDate { get; set; }

        [Column("alert_status")]
        [StringLength(50)]
        public string? AlertStatus { get; set; }

        [Column("justificacion_geo")]
        [StringLength(200)]
        public string? JustificacionGeo { get; set; }

        [Column("resolved_at")]
        public DateTime? ResolvedAt { get; set; }

        [Column("dni")]
        [StringLength(80)]
        public string? DNI { get; set; }
    }
}
