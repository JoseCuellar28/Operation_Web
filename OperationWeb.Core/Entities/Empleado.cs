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
        public int Id { get => IdEmpleado; set => IdEmpleado = value; }

        [NotMapped]
        public int IdEmpresa { get; set; }

        [NotMapped]
        public string? CodigoEmpleado { get; set; }

        [NotMapped]
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

        [NotMapped]
        public DateTime? FechaNacimiento { get; set; }

        [NotMapped] // DB does not have Email in COLABORADORES
        public string? Email { get; set; }

        [StringLength(20)]
        [Column("phone")]
        public string? Telefono { get; set; }

        [NotMapped]
        public int? IdJefeInmediato { get; set; }

        [NotMapped]
        public int? IdEmpleadoPerfil { get; set; }

        [NotMapped]
        [Column("division")] 
        public string? Division { get; set; } 

        [NotMapped]
        [Column("area")]
        public string? Area { get; set; } 

        [NotMapped]
        public bool? Administrador { get; set; }

        [NotMapped]
        public string? UsuarioActivo { get; set; } 
        
        [Column("active")]
        public bool? Active { get; set; }

        [Column("created_at")]
        public DateTime? FechaCreacion { get; set; }

        [Column("updated_at")]
        public DateTime? FechaModificacion { get; set; }

        [NotMapped]
        public string? UsuarioCreacion { get; set; }

        [NotMapped]
        public string? UsuarioModificacion { get; set; }

        [Column("rol")]
        [StringLength(50)]
        public string? Rol { get; set; }

        [Column("photo_url")]
        public string? PhotoUrl { get; set; }

        [Column("estado_operativo")]
        public string? EstadoOperativo { get; set; }

        [NotMapped]
        [Column("fecha_inicio")]
        public DateTime? FechaInicio { get; set; }

        [NotMapped]
        [Column("fecha_cese")]
        public DateTime? FechaCese { get; set; }

        [NotMapped]
        [Column("distrito")]
        public string? Distrito { get; set; }

        [NotMapped]
        [Column("codigo_cebe")]
        public string? CodigoCebe { get; set; }

        [Column("Proyecto")]
        public string? Proyecto { get; set; }


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
