using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OperationWeb.Core.Entities
{
    [Table("COLABORADORES")]
    public class ColaboradorMain
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("dni")]
        [StringLength(80)]
        public string DNI { get; set; } = string.Empty;

        [Column("nombre")]
        [StringLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [Column("rol")]
        [StringLength(50)]
        public string? Rol { get; set; }

        [Column("phone")]
        [StringLength(20)]
        public string? Telefono { get; set; }

        [Column("photo_url")]
        public string? PhotoUrl { get; set; }

        [Column("estado_operativo")]
        public string? EstadoOperativo { get; set; }

        [Column("active")]
        public bool? Active { get; set; }
        
        [Column("created_at")]
        public DateTime? CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }
    }
}
