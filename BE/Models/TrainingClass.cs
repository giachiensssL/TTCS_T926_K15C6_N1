namespace UserRoleDemo.Models;

public class TrainingClass
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string InstructorUserId { get; set; }
}
