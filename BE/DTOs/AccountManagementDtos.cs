using System.ComponentModel.DataAnnotations;

namespace UserRoleDemo.DTOs;

/// <summary>Credentials used to start an Identity session.</summary>
public sealed record LoginRequest
{
    [Required, EmailAddress, StringLength(254)]
    public required string Email { get; init; }

    [Required, StringLength(128, MinimumLength = 8)]
    public required string Password { get; init; }
}

/// <summary>Role information returned after authentication.</summary>
public sealed record LoginResponse(string Role);

/// <summary>A staff account and any classes that need a handover.</summary>
public sealed record StaffAccountResponse(
    string Id,
    string Email,
    IReadOnlyList<string> Roles,
    bool IsLocked,
    string? LockReason,
    DateTimeOffset? LockedAt,
    IReadOnlyList<string> ClassesToHandover);

/// <summary>Required reason for manually locking an account.</summary>
public sealed record LockAccountRequest
{
    [Required, StringLength(1000, MinimumLength = 1)]
    public required string Reason { get; init; }
}

/// <summary>Details of an account status operation.</summary>
public sealed record AccountStatusResponse(
    string UserId,
    bool IsLocked,
    string? Reason,
    DateTimeOffset? LockedAt,
    IReadOnlyList<string> ClassesToHandover);

/// <summary>Information used to create a class and assign its instructor.</summary>
public sealed record CreateTrainingClassRequest
{
    [Required, StringLength(200, MinimumLength = 1)]
    public required string Name { get; init; }

    [Required]
    public required string InstructorUserId { get; init; }
}

/// <summary>A training class assigned to a staff instructor.</summary>
public sealed record TrainingClassResponse(int Id, string Name, string InstructorUserId);
