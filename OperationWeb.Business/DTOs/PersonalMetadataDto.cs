namespace OperationWeb.Business.DTOs
{
    public class PersonalMetadataDto
    {
        public IEnumerable<string> Divisiones { get; set; } = new List<string>();
        public IEnumerable<string> Areas { get; set; } = new List<string>();
        public IEnumerable<string> Cargos { get; set; } = new List<string>();
    }
}
