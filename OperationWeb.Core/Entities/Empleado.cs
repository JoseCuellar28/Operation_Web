using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OperationWeb.Core.Entities
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
        [StringLength(80)]
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

        // Core Fix: DB uses Text for Area/Division
        [Column("division")] 
        public string? Division { get; set; } // Replaces IdUnidad

        [Column("area")]
        public string? Area { get; set; } // Replaces IdArea

        public bool? Administrador { get; set; }

        [NotMapped]
        public string? UsuarioActivo { get; set; } 
        
        [Column("active")]
        public bool? Active { get; set; }

        public DateTime? FechaCreacion { get; set; }

        public DateTime? FechaModificacion { get; set; }

        [StringLength(50)]
        public string? UsuarioCreacion { get; set; }

        [StringLength(50)]
        public string? UsuarioModificacion { get; set; }

        [Column("rol")]
        [StringLength(50)]
        public string? Rol { get; set; }

        [Column("photo_url")]
        public string? PhotoUrl { get; set; }

        [Column("estado_operativo")]
        public string? EstadoOperativo { get; set; }

        // Ghost Fields Restored
        [Column("fecha_inicio")]
        public DateTime? FechaInicio { get; set; }

        [Column("fecha_cese")]
        public DateTime? FechaCese { get; set; }

        [Column("distrito")]
        [StringLength(100)]
        public string? Distrito { get; set; }

        [Column("codigo_cebe")]
        [StringLength(50)]
        public string? CodigoCebe { get; set; }


        // Computed Properties
        [NotMapped]
        public string NombreCompleto => Nombre;

        [NotMapped]
        public string Estado => (Active == true) ? "Activo" : "Inactivo";

        [NotMapped]
        public string Cargo 
        { 
            get => Rol ?? "No definido";
            set => Rol = value;
        }

        [NotMapped]
        public string Departamento 
        { 
            get => Area ?? "No definido";
            set => Area = value;
        }
    }
}
