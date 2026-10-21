using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Data
{
    /// <summary>
    /// ApplicationDbContext - DbContext chính của ứng dụng.
    /// Kế thừa IdentityDbContext để sử dụng ASP.NET Core Identity.
    /// </summary>
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        /// <summary>
        /// Bảng UserSessions - quản lý phiên đăng nhập (S1-02).
        /// </summary>
        public DbSet<UserSession> UserSessions { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Cấu hình UserSession
            builder.Entity<UserSession>(entity =>
            {
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.RefreshToken).IsUnique();
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
