using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using UserRoleDemo.DTOs;
using UserRoleDemo.Models;

namespace UserRoleDemo.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/users")]
public class UserRoleController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;

    public UserRoleController(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    // Xem các vai trò của một user
    [HttpGet("{userId}/roles")]
    public async Task<IActionResult> GetRoles(
        string userId,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
            return NotFound("Không tìm thấy người dùng.");

        var roles = await _userManager.GetRolesAsync(user);

        return Ok(new
        {
            userId = user.Id,
            email = user.Email,
            roles
        });
    }

    // Gán thêm vai trò
    [HttpPost("{userId}/roles")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> AssignRole(
        string userId,
        [FromBody] AssignRoleRequest request,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
            return NotFound("Không tìm thấy người dùng.");

        var roleExists =
            await _roleManager.RoleExistsAsync(request.RoleName);

        if (!roleExists)
            return BadRequest("Vai trò không tồn tại.");

        var alreadyHasRole =
            await _userManager.IsInRoleAsync(
                user,
                request.RoleName);

        if (alreadyHasRole)
            return BadRequest(
                "Người dùng đã có vai trò này.");

        var result =
            await _userManager.AddToRoleAsync(
                user,
                request.RoleName);

        if (!result.Succeeded)
            return BadRequest(result.Errors);

        var stampResult = await _userManager.UpdateSecurityStampAsync(user);
        if (!stampResult.Succeeded)
            return BadRequest(stampResult.Errors);

        var roles =
            await _userManager.GetRolesAsync(user);

        return Ok(new
        {
            message = "Gán vai trò thành công.",
            roles
        });
    }

    // Thu hồi vai trò
    [HttpDelete("{userId}/roles/{roleName}")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> RemoveRole(
        string userId,
        string roleName,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
            return NotFound("Không tìm thấy người dùng.");

        // Không cho Admin tự xóa role Admin của chính mình
        if (User.FindFirstValue(ClaimTypes.NameIdentifier) == userId &&
            roleName.Equals(
                "Admin",
                StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(
                "Không thể tự thu hồi vai trò Admin của chính mình.");
        }

        var hasRole =
            await _userManager.IsInRoleAsync(
                user,
                roleName);

        if (!hasRole)
            return BadRequest(
                "Người dùng không có vai trò này.");

        var result =
            await _userManager.RemoveFromRoleAsync(
                user,
                roleName);

        if (!result.Succeeded)
            return BadRequest(result.Errors);

        var stampResult = await _userManager.UpdateSecurityStampAsync(user);
        if (!stampResult.Succeeded)
            return BadRequest(stampResult.Errors);

        var roles =
            await _userManager.GetRolesAsync(user);

        return Ok(new
        {
            message = "Thu hồi vai trò thành công.",
            roles
        });
    }
}