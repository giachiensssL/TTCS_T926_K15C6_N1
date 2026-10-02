using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserRoleDemo.DTOs;
using UserRoleDemo.Services;

namespace UserRoleDemo.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/users")]
public sealed class AccountManagementController(
    IAccountManagementService accountManagementService) : ControllerBase
{
    /// <summary>Lists staff accounts and classes requiring handover.</summary>
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<StaffAccountResponse>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<IReadOnlyList<StaffAccountResponse>>> GetStaffAccounts(
        CancellationToken cancellationToken)
    {
        var accounts = await accountManagementService.GetStaffAccountsAsync(cancellationToken);
        return Ok(accounts);
    }

    /// <summary>Locks a staff account and invalidates its active Identity sessions.</summary>
    [HttpPatch("{userId}/lock")]
    [ValidateAntiForgeryToken]
    [ProducesResponseType<AccountStatusResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<AccountStatusResponse>> LockAccount(
        string userId,
        [FromBody] LockAccountRequest request,
        CancellationToken cancellationToken)
    {
        var actorUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (actorUserId is null)
        {
            return Unauthorized();
        }

        try
        {
            var response = await accountManagementService.LockAccountAsync(
                userId,
                actorUserId,
                request.Reason,
                cancellationToken);

            return response is null ? NotFound() : Ok(response);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new ProblemDetails { Detail = exception.Message });
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new ProblemDetails { Detail = exception.Message });
        }
    }

    /// <summary>Unlocks a previously locked staff account.</summary>
    [HttpPatch("{userId}/unlock")]
    [ValidateAntiForgeryToken]
    [ProducesResponseType<AccountStatusResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<AccountStatusResponse>> UnlockAccount(
        string userId,
        CancellationToken cancellationToken)
    {
        var actorUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (actorUserId is null)
        {
            return Unauthorized();
        }

        try
        {
            var response = await accountManagementService.UnlockAccountAsync(
                userId,
                actorUserId,
                cancellationToken);

            return response is null ? NotFound() : Ok(response);
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new ProblemDetails { Detail = exception.Message });
        }
    }

    /// <summary>Creates a training class assigned to a teacher.</summary>
    [HttpPost("classes")]
    [ValidateAntiForgeryToken]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateTrainingClass(
        [FromBody] CreateTrainingClassRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new ProblemDetails { Detail = "Tên lớp là bắt buộc." });
        }

        try
        {
            var createdClass = await accountManagementService.CreateTrainingClassAsync(
                request.Name,
                request.InstructorUserId,
                cancellationToken);

            return createdClass is not null
                ? CreatedAtAction(
                    nameof(GetTrainingClass),
                    new { classId = createdClass.Id },
                    createdClass)
                : BadRequest(new ProblemDetails { Detail = "Không tìm thấy giảng viên." });
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(new ProblemDetails { Detail = exception.Message });
        }
    }

    /// <summary>Gets a class and its assigned instructor.</summary>
    [HttpGet("classes/{classId:int}")]
    [ProducesResponseType<TrainingClassResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TrainingClassResponse>> GetTrainingClass(
        int classId,
        CancellationToken cancellationToken)
    {
        var trainingClass = await accountManagementService.GetTrainingClassAsync(
            classId,
            cancellationToken);

        return trainingClass is null ? NotFound() : Ok(trainingClass);
    }
}
