using UserRoleDemo.DTOs;

namespace UserRoleDemo.Services;

public interface IAccountManagementService
{
    Task<IReadOnlyList<StaffAccountResponse>> GetStaffAccountsAsync(
        CancellationToken cancellationToken);

    Task<AccountStatusResponse?> LockAccountAsync(
        string userId,
        string actorUserId,
        string reason,
        CancellationToken cancellationToken);

    Task<AccountStatusResponse?> UnlockAccountAsync(
        string userId,
        string actorUserId,
        CancellationToken cancellationToken);

    Task<TrainingClassResponse?> CreateTrainingClassAsync(
        string name,
        string instructorUserId,
        CancellationToken cancellationToken);

    Task<TrainingClassResponse?> GetTrainingClassAsync(
        int classId,
        CancellationToken cancellationToken);
}
