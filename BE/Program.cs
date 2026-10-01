using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using UserRoleDemo.Data;
using UserRoleDemo.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

builder.Services
    .AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();
app.UseCors("AllowFrontend");   
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

await SeedData(app);

app.Run();


static async Task SeedData(WebApplication app)
{
    using var scope = app.Services.CreateScope();

    var roleManager =
        scope.ServiceProvider.GetRequiredService<
            RoleManager<IdentityRole>>();

    var userManager =
        scope.ServiceProvider.GetRequiredService<
            UserManager<ApplicationUser>>();

    string[] roles =
    {
        "Admin",
        "GiangVien",
        "QuanLyDaoTao"
    };

    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            await roleManager.CreateAsync(
                new IdentityRole(role)
            );
        }
    }

    var admin =
        await userManager.FindByEmailAsync(
            "admin@test.com"
        );

    if (admin == null)
    {
        admin = new ApplicationUser
        {
            UserName = "admin@test.com",
            Email = "admin@test.com",
            EmailConfirmed = true
        };

        await userManager.CreateAsync(
            admin,
            "Admin@123"
        );

        await userManager.AddToRoleAsync(
            admin,
            "Admin"
        );
    }

    var user =
        await userManager.FindByEmailAsync(
            "user@test.com"
        );

    if (user == null)
    {
        user = new ApplicationUser
        {
            UserName = "user@test.com",
            Email = "user@test.com",
            EmailConfirmed = true
        };

        await userManager.CreateAsync(
            user,
            "User@123"
        );

        await userManager.AddToRoleAsync(
            user,
            "GiangVien"
        );
    }
}