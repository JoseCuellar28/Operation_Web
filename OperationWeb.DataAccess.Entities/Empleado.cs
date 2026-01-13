using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OperationWeb.DataAccess.Entities
{
    [Table("COLABORADORES")]
    public class Empleado
    {
        [Key]
        [Column("id")]
        public int IdEmpleado { get; set; }

        [NotMapped]
        public int IdEmpresa { get; set; }

        [StringLength(50)]
        public string? CodigoEmpleado { get; set; }

        public int? TipoDocumento { get; set; }

        [NotMapped]
        public string? NumeroDocumento 
        { 
            get => DNI; 
            set => DNI = value ?? string.Empty; 
        }

        [Required]
        [Column("dni")]
        [StringLength(40)]
        public string DNI { get; set; } = string.Empty;

        [Required]
        [Column("nombre")]
        [StringLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [NotMapped]
        public string? ApellidoPaterno { get; set; }

        [NotMapped]
        public string? ApellidoMaterno { get; set; }

        public DateTime? FechaNacimiento { get; set; }

        [StringLength(100)]
        [EmailAddress]
        public string? Email { get; set; }

        [StringLength(20)]
        [Column("phone")]
        public string? Telefono { get; set; }

        public int? IdJefeInmediato { get; set; }

        public int? IdEmpleadoPerfil { get; set; }

        public int? IdUnidad { get; set; }

        public int? IdArea { get; set; }

        public bool? Administrador { get; set; }

        [NotMapped]
        public string? UsuarioActivo { get; set; } // Legacy used this
        
        [Column("active")]
        public bool? Active { get; set; } // Real DB column

        public DateTime? FechaCreacion { get; set; }

        public DateTime? FechaModificacion { get; set; }

        [StringLength(50)]
        public string? UsuarioCreacion { get; set; }

        [StringLength(50)]
        public string? UsuarioModificacion { get; set; }

        // New Mapped Columns based on audit
        [Column("rol")]
        [StringLength(50)]
        public string? Rol { get; set; }

        [Column("photo_url")]
        public string? PhotoUrl { get; set; }

        [Column("estado_operativo")]
        public string? EstadoOperativo { get; set; }

        // Propiedades calculadas para compatibilidad con el frontend
        [NotMapped]
        public string NombreCompleto => Nombre; // In legacy, 'nombre' might be full name

        [NotMapped]
        public string Estado => (Active == true) ? "Activo" : "Inactivo";

        [NotMapped]
        public string Cargo 
        { 
            get => Rol ?? "No definido";
            set => Rol = value;
        }

        [NotMapped]
        public string Departamento { get; set; } = "No definido";
    }
}