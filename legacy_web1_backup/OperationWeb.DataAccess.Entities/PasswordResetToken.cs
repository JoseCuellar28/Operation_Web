using System;
using System.ComponentModel.DataAnnotations;

namespace OperationWeb.DataAccess.Entities
{
    public class PasswordResetToken
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(40)]
        public string DNI { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Token { get; set; } = string.Empty;

        [Required]
        public DateTime CreatedAt { get; set; }

        [Required]
        public DateTime ExpiresAt { get; set; }

        public bool IsUsed { get; set; }

        public DateTime? UsedAt { get; set; }
    }
}
