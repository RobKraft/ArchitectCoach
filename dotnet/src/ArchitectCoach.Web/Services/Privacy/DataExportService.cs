using System.Text.Json;
using ArchitectCoach.Web.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ArchitectCoach.Web.Services.Privacy;

/// <summary>
/// "Export my data" (GDPR Art. 15/20, CCPA right to know): everything stored about the
/// signed-in user, as JSON. Security secrets (password hash, security stamp, authenticator
/// key, passkey credentials) are deliberately excluded: they aren't needed to exercise the
/// right, and a downloaded file holding them would weaken the account.
/// </summary>
public sealed class DataExportService(ApplicationDbContext db, UserManager<ApplicationUser> users)
{
    private static readonly JsonSerializerOptions Json = new() { WriteIndented = true };

    public async Task<byte[]> ExportAsync(ApplicationUser user, CancellationToken ct = default)
    {
        // The owner filter scopes this to the signed-in user; the user is the same person.
        var projects = await db.Projects.AsNoTracking()
            .Include(p => p.Decisions)
            .OrderBy(p => p.CreatedAt)
            .ToListAsync(ct);

        var export = new
        {
            exportedAt = DateTime.UtcNow,
            notice = "Everything ArchitectCoach stores about your account. Security secrets (password hash, authenticator key, passkey keys) are not included.",
            account = new
            {
                email = user.Email,
                emailConfirmed = user.EmailConfirmed,
                createdAt = user.CreatedAt,
                twoFactorEnabled = await users.GetTwoFactorEnabledAsync(user),
                passkeysRegistered = (await users.GetPasskeysAsync(user)).Count,
            },
            projects = projects.Select(p => new
            {
                id = p.Id,
                projectType = p.ProjectType,
                purpose = p.Purpose,
                createdAt = p.CreatedAt,
                updatedAt = p.UpdatedAt,
                questionsAnswered = p.StepIndex,
                knowledge = p.Knowledge,
                decisions = p.Decisions.OrderBy(d => d.Number).Select(d => new
                {
                    d.Number, d.Title, section = d.Section.ToString(), d.Decision, d.Rationale,
                    d.Alternatives, d.Tradeoffs, d.Consequences, d.LearnMore, d.CreatedAt,
                }),
            }),
        };
        return JsonSerializer.SerializeToUtf8Bytes(export, Json);
    }
}
