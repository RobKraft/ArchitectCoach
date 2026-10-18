namespace ArchitectCoach.Web.Services.Privacy;

/// <summary>
/// Who runs the site, shown on the privacy notice (bound from the "Site" configuration section).
/// These are the owner's decisions (docs/plans/dotnet-blazor-rewrite.md §14) and must be set
/// before a public launch; the app logs a critical warning in Production while they're empty.
/// </summary>
public sealed class SiteOptions
{
    public const string Section = "Site";

    /// <summary>Person or organization responsible for the site (the GDPR "controller").</summary>
    public string OperatorName { get; set; } = "";

    /// <summary>Where privacy requests and questions go.</summary>
    public string PrivacyContactEmail { get; set; } = "";

    /// <summary>Where the site and database are hosted, e.g. "United States (SmarterASP.NET)".</summary>
    public string HostingRegion { get; set; } = "";

    /// <summary>Date the privacy notice was last changed, shown on the page.</summary>
    public string PrivacyNoticeUpdated { get; set; } = "October 18, 2026";

    public bool IsConfigured =>
        OperatorName.Length > 0 && PrivacyContactEmail.Length > 0 && HostingRegion.Length > 0;
}
