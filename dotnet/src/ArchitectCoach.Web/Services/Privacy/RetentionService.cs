using ArchitectCoach.Web.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ArchitectCoach.Web.Services.Privacy;

/// <summary>
/// Retention rules from the privacy notice (docs/plans/dotnet-blazor-rewrite.md §7.5):
/// accounts never confirmed within <see cref="UnconfirmedAccountLifetime"/> are deleted, so an
/// email address typed by someone who never finished signing up isn't kept indefinitely.
/// </summary>
public sealed class RetentionService(ApplicationDbContext db, UserManager<ApplicationUser> users, ILogger<RetentionService> logger)
{
    public static readonly TimeSpan UnconfirmedAccountLifetime = TimeSpan.FromDays(7);

    /// <summary>Returns how many accounts were deleted. Logs counts only, never addresses.</summary>
    public async Task<int> DeleteExpiredUnconfirmedAccountsAsync(DateTime utcNow, CancellationToken ct = default)
    {
        var cutoff = utcNow - UnconfirmedAccountLifetime;
        var expired = await db.Users.Where(u => !u.EmailConfirmed && u.CreatedAt < cutoff).ToListAsync(ct);
        var deleted = 0;
        foreach (var user in expired)
        {
            if ((await users.DeleteAsync(user)).Succeeded) deleted++;
        }
        if (deleted > 0) logger.LogInformation("Retention: deleted {Count} unconfirmed account(s) older than {Days} days.", deleted, UnconfirmedAccountLifetime.TotalDays);
        return deleted;
    }
}

/// <summary>
/// Runs the retention rules at startup and then daily. On shared hosting the app pool may idle
/// and stop timers; the startup run catches up whenever it starts again.
/// </summary>
public sealed class RetentionWorker(IServiceScopeFactory scopes, ILogger<RetentionWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromDays(1));
        do
        {
            try
            {
                await using var scope = scopes.CreateAsyncScope();
                await scope.ServiceProvider.GetRequiredService<RetentionService>().DeleteExpiredUnconfirmedAccountsAsync(DateTime.UtcNow, stoppingToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogError(ex, "Retention cleanup failed; it will retry on the next run.");
            }
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }
}
