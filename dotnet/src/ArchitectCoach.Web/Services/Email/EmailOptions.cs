namespace ArchitectCoach.Web.Services.Email;

/// <summary>Bound from the "Email" configuration section.</summary>
public sealed class EmailOptions
{
    public const string Section = "Email";

    /// <summary>"Smtp" sends real mail; "Pickup" writes each message to <see cref="PickupDirectory"/> (development).</summary>
    public string Mode { get; set; } = "Smtp";

    public string PickupDirectory { get; set; } = "App_Data/mail-pickup";

    public string FromAddress { get; set; } = "";
    public string FromName { get; set; } = "ArchitectCoach";

    public string SmtpHost { get; set; } = "";
    public int SmtpPort { get; set; } = 587;
    public string SmtpUser { get; set; } = "";
    public string SmtpPassword { get; set; } = "";
}
