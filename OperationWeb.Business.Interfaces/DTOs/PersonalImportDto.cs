using System;

namespace OperationWeb.Business.Interfaces.DTOs
{
    public class PersonalImportDto
    {
        public string Dni { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty; // Inspector
        public string Distrito { get; set; } = string.Empty; // SedeTrabajo
        public string Tipo { get; set; } = string.Empty; // TipoTrabajador
        public string Estado { get; set; } = "ACTIVO"; // Situacion
        public DateTime FechaIngreso { get; set; }
        public DateTime? FechaCese { get; set; }
        public DateTime FechaNacimiento { get; set; }
        public string Division { get; set; } = string.Empty;
        public string Area { get; set; } = string.Empty;
        public string Cargo { get; set; } = string.Empty;
        public string CodigoEmpleado { get; set; } = string.Empty;
        public string CodigoCebe { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Telefono { get; set; } = string.Empty;
    }
}
