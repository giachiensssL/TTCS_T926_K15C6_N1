using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Mvc;
using UserRoleDemo.DTOs;
using UserRoleDemo.Models;

namespace UserRoleDemo.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(
    SignInManager<ApplicationUser> signInManager,
    UserManager<ApplicationUser> userManager,
    IAntiforgery antiforgery) : ControllerBase
{
    /// <summary>Issues the request token required for cookie-authenticated mutations.</summary>
    [AllowAnonymous]
    [HttpGet("csrf")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult GetCsrfToken()
    {
        var tokens = antiforgery.GetAndStoreTokens(HttpContext);
        return Ok(new { requestToken = tokens.RequestToken });
    }

    /// <summary>Starts a secure Identity cookie session.</summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [ValidateAntiForgeryToken]
    [ProducesResponseType<LoginResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<LoginResponse>> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null)
        {
            return Unauthorized(new
            {
                code = "AUTH_INVALID_CREDENTIALS",
                message = "Email hoặc mật khẩu không đúng."
            });
        }

        if (user.IsManuallyLocked)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                code = "AUTH_ACCOUNT_DISABLED",
                message = "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên."
            });
        }

        var result = await signInManager.PasswordSignInAsync(
            user,
            request.Password,
            isPersistent: false,
            lockoutOnFailure: true);

        if (result.IsLockedOut)
        {
            return StatusCode(StatusCodes.Status429TooManyRequests, new
            {
                code = "AUTH_ACCOUNT_LOCKED",
                message = "Tài khoản tạm thời bị khóa.",
                lockedUntil = user.LockoutEnd
            });
        }

        if (!result.Succeeded)
        {
            return Unauthorized(new
            {
                code = "AUTH_INVALID_CREDENTIALS",
                message = "Email hoặc mật khẩu không đúng."
            });
        }

        var roles = await userManager.GetRolesAsync(user);
        var role = roles
            .OrderBy(candidate => candidate == "Admin" ? 0 : 1)
            .FirstOrDefault();
        if (role is null)
        {
            await signInManager.SignOutAsync();
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                code = "AUTH_ROLE_REQUIRED",
                message = "Tài khoản chưa được cấp vai trò."
            });
        }

        return Ok(new LoginResponse(ToFrontendRole(role)));
    }

    /// <summary>Returns the role associated with the current session.</summary>
    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType<LoginResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public ActionResult<LoginResponse> GetCurrentUser()
    {
        var roles = User.Claims
            .Where(claim => claim.Type == System.Security.Claims.ClaimTypes.Role)
            .Select(claim => claim.Value)
            .ToArray();
        var role = roles
            .OrderBy(candidate => candidate == "Admin" ? 0 : 1)
            .FirstOrDefault();

        return role is null
            ? Forbid()
            : Ok(new LoginResponse(ToFrontendRole(role)));
    }

    /// <summary>Ends the current Identity cookie session.</summary>
    [Authorize]
    [HttpPost("logout")]
    [ValidateAntiForgeryToken]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        await signInManager.SignOutAsync();
        return NoContent();
    }

    private static string ToFrontendRole(string role) => role switch
    {
        "Admin" => "ADMIN",
        "QuanLyDaoTao" => "TRAINING_MANAGER",
        "GiangVien" => "TEACHER",
        "TroGiang" => "ASSISTANT",
        "TuVanTuyenSinh" => "CONSULTANT",
        "KeToan" => "ACCOUNTANT",
        "HocVien" => "STUDENT",
        "Khach" => "GUEST",
        _ => role.ToUpperInvariant()
    };
}
