namespace OperationWeb.Business.DTOs
{
    /// <summary>
    /// DTO para importación individual de colaborador desde Excel
    /// </summary>
    public class PersonalImportDto
    {
        // Identificación
        public string DNI { get; set; } = string.Empty;
        public string? CodigoSAP { get; set; }
        
        // Datos personales
        public string? Trabajador { get; set; }
        public DateTime? FechaNacimiento { get; set; }
        public string? Sexo { get; set; }
        public int? Edad { get; set; }
        
        // Organización
        public string? Situacion { get; set; }
        public string? Categoria { get; set; }
        public string? Cargo { get; set; }
        public string? Division { get; set; }
        public string? LineaNegocio { get; set; }
        public string? AreaProyecto { get; set; }
        public string? SeccionServicio { get; set; }
        public string? DetalleCebe { get; set; }
        public string? CodigoCebe { get; set; }
        
        // Estado laboral
        public DateTime? FechaIngreso { get; set; }
        public DateTime? FechaCese { get; set; }
        public string? MotivoCese { get; set; }
        public decimal? Permanencia { get; set; }
        
        // Contacto
        public string? CorreoCorporativo { get; set; }
        public string? CorreoPersonal { get; set; }
        public string? Telefono { get; set; }
        
        // Otros
        public string? SedeTrabajo { get; set; }
        public string? JefeInmediato { get; set; }
        public string? Comentario { get; set; }
    }

    /// <summary>
    /// DTO para solicitud de importación masiva
    /// </summary>
    public class BulkImportRequestDto
    {
        public List<PersonalImportDto> Employees { get; set; } = new();
        public string Usuario { get; set; } = "Sistema";
    }

    /// <summary>
    /// DTO para resultado de importación masiva
    /// </summary>
    public class BulkImportResultDto
    {
        public int Created { get; set; }
        public int Updated { get; set; }
        public int Unchanged { get; set; }
        public int Failed { get; set; }
        public List<string> Errors { get; set; } = new();
        public string Message { get; set; } = string.Empty;
    }
}
