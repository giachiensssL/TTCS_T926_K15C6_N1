using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using UserRoleDemo.Data;
using UserRoleDemo.DTOs;
using UserRoleDemo.Models;

namespace UserRoleDemo.Services;

public sealed class AccountManagementService(
    ApplicationDbContext dbContext,
    UserManager<ApplicationUser> userManager) : IAccountManagementService
{
    private static readonly string[] StaffRoles =
    [
        "Admin",
        "GiangVien",
        "TroGiang",
        "QuanLyDaoTao",
        "TuVanTuyenSinh",
        "KeToan"
    ];

    public async Task<IReadOnlyList<StaffAccountResponse>> GetStaffAccountsAsync(
        CancellationToken cancellationToken)
    {
        var users = await dbContext.Users
            .AsNoTracking()
            .OrderBy(user => user.Email)
            .ToListAsync(cancellationToken);

        var staff = new List<(ApplicationUser User, IList<string> Roles)>();
        foreach (var user in users)
        {
            var roles = await userManager.GetRolesAsync(user);
            if (roles.Any(role => StaffRoles.Contains(role, StringComparer.OrdinalIgnoreCase)))
            {
                staff.Add((user, roles));
            }
        }

        var staffIds = staff.Select(item => item.User.Id).ToArray();
        var classes = await dbContext.TrainingClasses
            .AsNoTracking()
            .Where(trainingClass => staffIds.Contains(trainingClass.InstructorUserId))
            .ToListAsync(cancellationToken);

        return staff.Select(item => new StaffAccountResponse(
            item.User.Id,
            item.User.Email ?? string.Empty,
            item.Roles.ToArray(),
            item.User.IsManuallyLocked,
            item.User.LockReason,
            item.User.LockedAt,
            classes
                .Where(trainingClass => trainingClass.InstructorUserId == item.User.Id)
                .Select(trainingClass => trainingClass.Name)
                .ToArray()))
            .ToArray();
    }

    public async Task<AccountStatusResponse?> LockAccountAsync(
        string userId,
        string actorUserId,
        string reason,
        CancellationToken cancellationToken)
    {
        var normalizedReason = reason.Trim();
        if (normalizedReason.Length == 0)
        {
            throw new ArgumentException("Lý do khóa tài khoản là bắt buộc.", nameof(reason));
        }

        var user = await userManager.FindByIdAsync(userId);
        if (user is null || !await IsStaffAccountAsync(user))
        {
            return null;
        }

        if (user.Id == actorUserId)
        {
            throw new InvalidOperationException("Không thể khóa tài khoản đang đăng nhập.");
        }

        if (user.IsManuallyLocked)
        {
            throw new InvalidOperationException("Tài khoản đã bị khóa.");
        }

        await EnsureAnotherActiveAdminExistsAsync(user, cancellationToken);

        var now = DateTimeOffset.UtcNow;
        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);

        user.IsManuallyLocked = true;
        user.LockReason = normalizedReason;
        user.LockedAt = now;
        user.LockedByUserId = actorUserId;
        user.LockoutEnabled = true;
        user.LockoutEnd = DateTimeOffset.MaxValue;

        var updateResult = await userManager.UpdateAsync(user);
        EnsureIdentityUpdateSucceeded(updateResult);
        var stampResult = await userManager.UpdateSecurityStampAsync(user);
        EnsureIdentityUpdateSucceeded(stampResult);

        dbContext.AccountStatusChanges.Add(new AccountStatusChange
        {
            UserId = user.Id,
            ActorUserId = actorUserId,
            Action = "LOCK",
            Reason = normalizedReason,
            ChangedAt = now
        });
        await dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return await BuildStatusResponseAsync(user, cancellationToken);
    }

    public async Task<AccountStatusResponse?> UnlockAccountAsync(
        string userId,
        string actorUserId,
        CancellationToken cancellationToken)
    {
        var user = await userManager.FindByIdAsync(userId);
        if (user is null || !await IsStaffAccountAsync(user))
        {
            return null;
        }

        if (!user.IsManuallyLocked)
        {
            throw new InvalidOperationException("Tài khoản hiện không bị khóa.");
        }

        var now = DateTimeOffset.UtcNow;
        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);

        user.IsManuallyLocked = false;
        user.LockReason = null;
        user.LockedAt = null;
        user.LockedByUserId = null;
        user.LockoutEnd = null;
        user.AccessFailedCount = 0;

        var updateResult = await userManager.UpdateAsync(user);
        EnsureIdentityUpdateSucceeded(updateResult);
        var stampResult = await userManager.UpdateSecurityStampAsync(user);
        EnsureIdentityUpdateSucceeded(stampResult);

        dbContext.AccountStatusChanges.Add(new AccountStatusChange
        {
            UserId = user.Id,
            ActorUserId = actorUserId,
            Action = "UNLOCK",
            Reason = "Mở khóa tài khoản",
            ChangedAt = now
        });
        await dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return await BuildStatusResponseAsync(user, cancellationToken);
    }

    public async Task<TrainingClassResponse?> CreateTrainingClassAsync(
        string name,
        string instructorUserId,
        CancellationToken cancellationToken)
    {
        var instructor = await userManager.FindByIdAsync(instructorUserId);
        if (instructor is null)
        {
            return null;
        }

        if (instructor.IsManuallyLocked ||
            !await userManager.IsInRoleAsync(instructor, "GiangVien"))
        {
            throw new InvalidOperationException("Người phụ trách phải là giảng viên đang hoạt động.");
        }

        var trainingClass = new TrainingClass
        {
            Name = name.Trim(),
            InstructorUserId = instructor.Id
        };
        dbContext.TrainingClasses.Add(trainingClass);
        await dbContext.SaveChangesAsync(cancellationToken);
        return new TrainingClassResponse(
            trainingClass.Id,
            trainingClass.Name,
            trainingClass.InstructorUserId);
    }

    public async Task<TrainingClassResponse?> GetTrainingClassAsync(
        int classId,
        CancellationToken cancellationToken)
    {
        return await dbContext.TrainingClasses
            .AsNoTracking()
            .Where(trainingClass => trainingClass.Id == classId)
            .Select(trainingClass => new TrainingClassResponse(
                trainingClass.Id,
                trainingClass.Name,
                trainingClass.InstructorUserId))
            .SingleOrDefaultAsync(cancellationToken);
    }

    private async Task EnsureAnotherActiveAdminExistsAsync(
        ApplicationUser target,
        CancellationToken cancellationToken)
    {
        if (!await userManager.IsInRoleAsync(target, "Admin"))
        {
            return;
        }

        var admins = await userManager.GetUsersInRoleAsync("Admin");
        if (!admins.Any(admin => admin.Id != target.Id && !admin.IsManuallyLocked))
        {
            throw new InvalidOperationException("Không thể khóa quản trị viên cuối cùng đang hoạt động.");
        }
    }

    private async Task<bool> IsStaffAccountAsync(ApplicationUser user)
    {
        var roles = await userManager.GetRolesAsync(user);
        return roles.Any(role => StaffRoles.Contains(role, StringComparer.OrdinalIgnoreCase));
    }

    private async Task<AccountStatusResponse> BuildStatusResponseAsync(
        ApplicationUser user,
        CancellationToken cancellationToken)
    {
        var classes = await dbContext.TrainingClasses
            .AsNoTracking()
            .Where(trainingClass => trainingClass.InstructorUserId == user.Id)
            .OrderBy(trainingClass => trainingClass.Name)
            .Select(trainingClass => trainingClass.Name)
            .ToArrayAsync(cancellationToken);

        return new AccountStatusResponse(
            user.Id,
            user.IsManuallyLocked,
            user.LockReason,
            user.LockedAt,
            classes);
    }

    private static void EnsureIdentityUpdateSucceeded(IdentityResult result)
    {
        if (!result.Succeeded)
        {
            throw new InvalidOperationException(
                string.Join("; ", result.Errors.Select(error => error.Description)));
        }
    }
}
