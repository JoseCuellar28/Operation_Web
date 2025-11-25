using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OperationWeb.DataAccess.Entities
{
    [Table("Empleado")]
    public class Empleado
    {
        [Key]
        public int IdEmpleado { get; set; }

        public int IdEmpresa { get; set; }

        [StringLength(50)]
        public string? CodigoEmpleado { get; set; }

        public int? TipoDocumento { get; set; }

        [StringLength(20)]
        public string? NumeroDocumento { get; set; }

        [Required]
        [StringLength(40)]
        public string DNI { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [StringLength(100)]
        public string? ApellidoPaterno { get; set; }

        [StringLength(100)]
        public string? ApellidoMaterno { get; set; }

        public DateTime? FechaNacimiento { get; set; }

        [StringLength(100)]
        [EmailAddress]
        public string? Email { get; set; }

        [StringLength(20)]
        public string? Telefono { get; set; }

        public int? IdJefeInmediato { get; set; }

        public int? IdEmpleadoPerfil { get; set; }

        public int? IdUnidad { get; set; }

        public int? IdArea { get; set; }

        public bool? Administrador { get; set; }

        [StringLength(1)]
        public string? UsuarioActivo { get; set; }

        public DateTime? FechaCreacion { get; set; }

        public DateTime? FechaModificacion { get; set; }

        [StringLength(50)]
        public string? UsuarioCreacion { get; set; }

        [StringLength(50)]
        public string? UsuarioModificacion { get; set; }

        // Propiedades calculadas para compatibilidad con el frontend
        [NotMapped]
        public string NombreCompleto => $"{Nombre} {ApellidoPaterno} {ApellidoMaterno}".Trim();

        [NotMapped]
        public string Estado => UsuarioActivo == "S" ? "Activo" : "Inactivo";

        [NotMapped]
        public string Cargo { get; set; } = "No definido"; // Se llenará desde IdEmpleadoPerfil

        [NotMapped]
        public string Departamento { get; set; } = "No definido"; // Se llenará desde IdArea
    }
}