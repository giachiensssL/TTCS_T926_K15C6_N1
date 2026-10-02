using Microsoft.AspNetCore.Identity;

namespace UserRoleDemo.Models;

public class ApplicationUser : IdentityUser
{
    public bool IsManuallyLocked { get; set; }
    public string? LockReason { get; set; }
    public DateTimeOffset? LockedAt { get; set; }
    public string? LockedByUserId { get; set; }
}