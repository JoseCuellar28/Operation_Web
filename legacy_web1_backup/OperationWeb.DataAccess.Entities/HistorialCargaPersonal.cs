using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OperationWeb.DataAccess.Entities
{
    [Table("Historial_Cargas_Personal")]
    public class HistorialCargaPersonal
    {
        [Key]
        public int Id { get; set; }

        public DateTime FechaCarga { get; set; }

        [StringLength(520)]
        public string? Archivo { get; set; }

        [StringLength(200)]
        public string? Hoja { get; set; }

        [StringLength(20)]
        public string? Periodo { get; set; }

        public int? FilasProcesadas { get; set; }

        public int? InsertadosSnapshot { get; set; }

        public int? ActualizadosSnapshot { get; set; }

        public int? Duplicados { get; set; }

        public int? EventosGenerados { get; set; }

        [StringLength(100)]
        public string? Usuario { get; set; }
    }
}
