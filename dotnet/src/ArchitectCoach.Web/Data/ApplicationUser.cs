using Microsoft.AspNetCore.Identity;

namespace ArchitectCoach.Web.Data;

/// <summary>
/// An account. By design the only personal data collected is the email address (plus the
/// security data Identity needs: password hash, lockout counters, optional 2FA/passkeys).
/// See docs/plans/dotnet-blazor-rewrite.md §7.1. Don't add profile fields without updating the
/// privacy notice and the data export.
/// </summary>
public class ApplicationUser : IdentityUser
{
    /// <summary>When the account was created (UTC). Used by the unconfirmed-account retention rule.</summary>
    [PersonalData]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
