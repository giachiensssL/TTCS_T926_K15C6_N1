using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using UserRoleDemo.Services;
using UserRoleDemo.Data;
using UserRoleDemo.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddScoped<IAccountManagementService, AccountManagementService>();
builder.Services.AddAntiforgery(options => options.HeaderName = "X-CSRF-TOKEN");
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

builder.Services.Configure<IdentityOptions>(options =>
{
    options.Lockout.AllowedForNewUsers = true;
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
});

builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.Name = "TMS.Identity";
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Strict;
    options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
    options.ExpireTimeSpan = TimeSpan.FromHours(8);
    options.SlidingExpiration = false;
    options.Events.OnRedirectToLogin = context =>
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return Task.CompletedTask;
    };
    options.Events.OnRedirectToAccessDenied = context =>
    {
        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        return Task.CompletedTask;
    };
});
builder.Services.Configure<SecurityStampValidatorOptions>(options =>
    options.ValidationInterval = TimeSpan.Zero);

builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();
app.UseCors("AllowFrontend");   
app.UseDefaultFiles();
app.UseStaticFiles();

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

if (app.Environment.IsDevelopment())
{
    await SeedData(app);
}

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
        "TroGiang",
        "QuanLyDaoTao",
        "TuVanTuyenSinh",
        "KeToan",
        "HocVien",
        "Khach"
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
            EmailConfirmed = true,
            LockoutEnabled = true
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
            EmailConfirmed = true,
            LockoutEnabled = true
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