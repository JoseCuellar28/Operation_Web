using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OperationWeb.Core.Entities
{
    [Table("UserActivations")]
    public class UserActivation
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        [StringLength(40)]
        public string DNI { get; set; } = string.Empty;

        [Required]
        [StringLength(64)]
        public string Token { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string Purpose { get; set; } = string.Empty;

        public DateTime IssuedAt { get; set; }

        public DateTime ExpiresAt { get; set; }

        public DateTime? UsedAt { get; set; }

        [StringLength(100)]
        public string? IssuedBy { get; set; }

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = string.Empty;

        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }
    }
}
