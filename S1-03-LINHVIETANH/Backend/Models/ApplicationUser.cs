using Microsoft.AspNetCore.Identity;

namespace Backend.Models
{
    /// <summary>
    /// ApplicationUser kế thừa IdentityUser, đại diện cho người dùng trong hệ thống.
    /// </summary>
    public class ApplicationUser : IdentityUser
    {
        public string FullName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
