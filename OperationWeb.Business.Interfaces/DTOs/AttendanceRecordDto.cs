using System;
// using OperationWeb.DataAccess.DTOs; // REMOVED

namespace OperationWeb.Business.Interfaces.DTOs
{
    public class AttendanceRecordDto
    {
        public string id { get; set; }
        public int employee_id { get; set; }
        public string date { get; set; }
        public string? check_in_time { get; set; }
        public decimal? location_lat { get; set; }
        public decimal? location_lng { get; set; }
        public string? location_address { get; set; }
        public string health_status { get; set; }
        public string system_status { get; set; }
        public bool whatsapp_sync { get; set; }
        public string? sync_date { get; set; }
        public string? alert_status { get; set; }
        public string? gps_justification { get; set; }
        public string? resolved_at { get; set; }
        public EmployeeDto employee { get; set; }
    }
}
