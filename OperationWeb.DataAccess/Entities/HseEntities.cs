using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OperationWeb.DataAccess.Entities
{
    [Table("HSE_Inspections")]
    public class HseInspection
    {
        [Key]
        public int Id { get; set; }
        public string InspectorDNI { get; set; }
        public DateTime Date { get; set; }
        public string Type { get; set; } // Vehicular, Site
        public string ReferenceId { get; set; }
        public string Status { get; set; }
        public decimal Score { get; set; }
        public string? Comments { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    [Table("HSE_Incidents")]
    public class HseIncident
    {
        [Key]
        public int Id { get; set; }
        public string ReporterDNI { get; set; }
        public DateTime Date { get; set; }
        public string Description { get; set; }
        public string? Location { get; set; }
        public string Severity { get; set; }
        public string Status { get; set; }
        public string? ActionTaken { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    [Table("HSE_PPE_Delivery")]
    public class HsePpeDelivery
    {
        [Key]
        public int Id { get; set; }
        public string WorkerDNI { get; set; }
        public string DelivererDNI { get; set; }
        public DateTime Date { get; set; }
        public string ItemsJson { get; set; }
        public string? SignatureMetadata { get; set; }
        public string? Comments { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
