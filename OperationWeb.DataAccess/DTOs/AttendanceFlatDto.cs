namespace OperationWeb.DataAccess.DTOs
{
    public class AttendanceFlatDto
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
        
        // Employee Cols
        public string? emp_name { get; set; }
        public string? emp_role { get; set; }
        public string? emp_photo { get; set; }
        public string? emp_phone { get; set; }
        public string? emp_status { get; set; }
        public bool emp_active { get; set; }
    }
}
