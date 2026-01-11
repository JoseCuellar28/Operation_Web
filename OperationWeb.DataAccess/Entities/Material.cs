using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace OperationWeb.DataAccess.Entities
{
    public class Material
    {
        [Column("id_material")]
        public Guid Id { get; set; }

        [Column("nombre")]
        public string Nombre { get; set; }

        [Column("tipo")]
        public string Tipo { get; set; }

        [Column("unidad_medida")]
        public string UnidadMedida { get; set; }

        [Column("costo_unitario")]
        public decimal CostoUnitario { get; set; }

        [Column("id_gesproyec")]
        public string? IdGesproyec { get; set; }

        [Column("categoria")]
        public string? Categoria { get; set; }
    }
}
