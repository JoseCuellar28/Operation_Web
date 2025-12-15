using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OperationWeb.DataAccess.Entities
{
    [Table("UserAccessConfigs")]
    public class UserAccessConfig
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        public bool AccessWeb { get; set; } = true;
        public bool AccessApp { get; set; } = true;

        [StringLength(50)]
        public string? JobLevel { get; set; } // 'Manager', 'Coordinator', 'Supervisor', 'Employee'

        [StringLength(100)]
        public string? ProjectScope { get; set; }

        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }
}
