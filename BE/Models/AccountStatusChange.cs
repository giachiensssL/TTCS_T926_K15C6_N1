namespace UserRoleDemo.Models;

public class AccountStatusChange
{
    public int Id { get; set; }
    public required string UserId { get; set; }
    public required string ActorUserId { get; set; }
    public required string Action { get; set; }
    public required string Reason { get; set; }
    public DateTimeOffset ChangedAt { get; set; }
}
