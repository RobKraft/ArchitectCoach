using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace ArchitectCoach.Web.Services.Email;

/// <summary>Delivers a fully built message. The From address is filled in from configuration.</summary>
public interface IMailTransport
{
    Task SendAsync(MimeMessage message, CancellationToken cancellationToken = default);
}

/// <summary>Production: SmarterASP (or any) SMTP server over TLS.</summary>
public sealed class SmtpMailTransport(IOptions<EmailOptions> options) : IMailTransport
{
    public async Task SendAsync(MimeMessage message, CancellationToken cancellationToken = default)
    {
        var o = options.Value;
        message.From.Add(new MailboxAddress(o.FromName, o.FromAddress));

        using var client = new SmtpClient { Timeout = 20_000 };
        await client.ConnectAsync(o.SmtpHost, o.SmtpPort, SecureSocketOptions.StartTlsWhenAvailable, cancellationToken);
        if (!client.IsSecure)
        {
            // Never send credentials (or reset links) over an unencrypted connection.
            await client.DisconnectAsync(true, cancellationToken);
            throw new InvalidOperationException("SMTP server did not offer TLS; refusing to send.");
        }
        if (!string.IsNullOrEmpty(o.SmtpUser))
            await client.AuthenticateAsync(o.SmtpUser, o.SmtpPassword, cancellationToken);
        await client.SendAsync(message, cancellationToken);
        await client.DisconnectAsync(true, cancellationToken);
    }
}

/// <summary>Development: writes each message as an .eml file instead of sending it.</summary>
public sealed class PickupFolderMailTransport(IOptions<EmailOptions> options, IWebHostEnvironment env) : IMailTransport
{
    public async Task SendAsync(MimeMessage message, CancellationToken cancellationToken = default)
    {
        var o = options.Value;
        message.From.Add(new MailboxAddress(o.FromName, string.IsNullOrEmpty(o.FromAddress) ? "noreply@localhost" : o.FromAddress));
        var dir = Path.Combine(env.ContentRootPath, o.PickupDirectory);
        Directory.CreateDirectory(dir);
        var file = Path.Combine(dir, $"{DateTime.UtcNow:yyyyMMdd-HHmmss-fff}-{Guid.NewGuid():N}.eml");
        await message.WriteToAsync(file, cancellationToken);
    }
}
