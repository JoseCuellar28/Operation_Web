namespace OperationWeb.DataAccess.DTOs
{
    public class EmployeeDto
    {
        public int id { get; set; }
        public string? name { get; set; }
        public string? role { get; set; }
        public string? photo_url { get; set; }
        public string? phone { get; set; }
        public string? estado_operativo { get; set; }
        public bool active { get; set; }
        public string? dni { get; set; }
    }
}
