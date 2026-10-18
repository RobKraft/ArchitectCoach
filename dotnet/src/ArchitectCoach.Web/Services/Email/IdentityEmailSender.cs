using System.Net;
using ArchitectCoach.Web.Data;
using Microsoft.AspNetCore.Identity;
using MimeKit;

namespace ArchitectCoach.Web.Services.Email;

/// <summary>
/// Builds Identity's account emails and hands them to an <see cref="IMailTransport"/> (SMTP in
/// production, a pickup folder in development). Messages never include anything beyond the
/// link or code itself, and nothing here logs the recipient address (docs/plans §7.4).
/// </summary>
public sealed class IdentityEmailSender(IMailTransport transport) : IEmailSender<ApplicationUser>
{
    public Task SendConfirmationLinkAsync(ApplicationUser user, string email, string confirmationLink) =>
        transport.SendAsync(Build(email, "Confirm your ArchitectCoach account",
            "Confirm your email address to finish creating your ArchitectCoach account.",
            "Confirm my email", confirmationLink,
            "If you didn't create an account, you can ignore this email and no account will be activated."));

    public Task SendPasswordResetLinkAsync(ApplicationUser user, string email, string resetLink) =>
        transport.SendAsync(Build(email, "Reset your ArchitectCoach password",
            "Someone asked to reset the password for your ArchitectCoach account.",
            "Reset my password", resetLink,
            "If you didn't ask for this, ignore this email. Your password won't change."));

    public Task SendPasswordResetCodeAsync(ApplicationUser user, string email, string resetCode) =>
        transport.SendAsync(Build(email, "Your ArchitectCoach password reset code",
            $"Your password reset code is: {resetCode}", null, null,
            "If you didn't ask for this, ignore this email. Your password won't change."));

    private static MimeMessage Build(string to, string subject, string intro, string? linkText, string? link, string footer)
    {
        var message = new MimeMessage { Subject = subject };
        message.To.Add(MailboxAddress.Parse(to));

        var text = link is null ? $"{intro}\n\n{footer}" : $"{intro}\n\n{linkText}: {link}\n\n{footer}";
        var html = link is null
            ? $"<p>{WebUtility.HtmlEncode(intro)}</p><p>{WebUtility.HtmlEncode(footer)}</p>"
            : $"<p>{WebUtility.HtmlEncode(intro)}</p><p><a href=\"{WebUtility.HtmlEncode(link)}\">{WebUtility.HtmlEncode(linkText)}</a></p>" +
              $"<p>Or paste this link into your browser:<br>{WebUtility.HtmlEncode(link)}</p><p>{WebUtility.HtmlEncode(footer)}</p>";

        message.Body = new BodyBuilder { TextBody = text, HtmlBody = html }.ToMessageBody();
        return message;
    }
}
