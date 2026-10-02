using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using UserRoleDemo.Models;

namespace UserRoleDemo.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public DbSet<TrainingClass> TrainingClasses => Set<TrainingClass>();
    public DbSet<AccountStatusChange> AccountStatusChanges => Set<AccountStatusChange>();

    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<TrainingClass>()
            .HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(trainingClass => trainingClass.InstructorUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<TrainingClass>()
            .Property(trainingClass => trainingClass.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Entity<AccountStatusChange>()
            .Property(change => change.Action)
            .HasMaxLength(20)
            .IsRequired();

        builder.Entity<AccountStatusChange>()
            .Property(change => change.Reason)
            .HasMaxLength(1000)
            .IsRequired();
    }
}