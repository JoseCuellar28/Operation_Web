using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OperationWeb.Core.Entities
{
    [Table("Estado_Salud")]
    public class EstadoSalud
    {
        [Key]
        [Column("id_salud")]
        public int IdSalud { get; set; }

        [Column("id_colaborador")]
        public int IdColaborador { get; set; }

        [Column("fecha")]
        public DateTime Fecha { get; set; }

        [Column("respuestas_json")]
        public string? RespuestasJson { get; set; }

        [Column("apto")]
        public bool Apto { get; set; }
    }
}
