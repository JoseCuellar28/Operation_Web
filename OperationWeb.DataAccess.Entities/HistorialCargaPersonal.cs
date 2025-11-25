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

        [StringLength(100)]
        public string? Usuario { get; set; }
    }
}
