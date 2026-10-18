// Phase 0 hosting probe (docs/plans/dotnet-blazor-rewrite.md §2). A throwaway app that reports
// what the SmarterASP environment actually provides, so the real app isn't built on guesses.
// Delete it from the host once docs/plans/phase0-hosting-checklist.md is filled in.
//
// Every route returns 404 unless the request carries the configured Probe:Key, so the page
// doesn't advertise server details. The test email only ever goes to Probe:TestRecipient from
// config, never to an address taken from the request, so it can't be used as a mail relay.

using System.Net;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Text;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Data.SqlClient;
using MimeKit;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
var config = app.Configuration;

bool Authorized(HttpContext ctx)
{
    var expected = config["Probe:Key"];
    if (string.IsNullOrWhiteSpace(expected) || expected.Length < 16) return false;
    var given = ctx.Request.HasFormContentType ? ctx.Request.Form["key"].ToString() : ctx.Request.Query["key"].ToString();
    return CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(given), Encoding.UTF8.GetBytes(expected));
}

static string Row(string name, object? value) =>
    $"<tr><th scope=\"row\">{WebUtility.HtmlEncode(name)}</th><td>{WebUtility.HtmlEncode(value?.ToString() ?? "")}</td></tr>";

static IResult Page(string title, string body) => Results.Content(
    $$"""
    <!doctype html><html lang="en"><head><meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
    <title>{{WebUtility.HtmlEncode(title)}}</title>
    <style>body{font-family:system-ui,sans-serif;max-width:860px;margin:2rem auto;padding:0 1rem}
    table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:.4rem;text-align:left;vertical-align:top}
    th{width:35%}.ok{color:#166534}.bad{color:#b91c1c}</style></head>
    <body><h1>{{WebUtility.HtmlEncode(title)}}</h1>{{body}}</body></html>
    """, "text/html");

app.MapGet("/", (HttpContext ctx) =>
{
    if (!Authorized(ctx)) return Results.NotFound();
    var key = WebUtility.HtmlEncode(ctx.Request.Query["key"].ToString());
    var proc = System.Diagnostics.Process.GetCurrentProcess();

    var writable = "no";
    try
    {
        var probeFile = Path.Combine(AppContext.BaseDirectory, "App_Data", "probe-write-test.txt");
        Directory.CreateDirectory(Path.GetDirectoryName(probeFile)!);
        File.WriteAllText(probeFile, DateTime.UtcNow.ToString("O"));
        File.Delete(probeFile);
        writable = "yes (App_Data)";
    }
    catch (Exception ex) { writable = $"no ({ex.GetType().Name})"; }

    var rows = string.Concat(
        Row("A1 .NET runtime", RuntimeInformation.FrameworkDescription),
        Row("A1 Hosting process (w3wp = IIS in-process)", proc.ProcessName),
        Row("OS", RuntimeInformation.OSDescription),
        Row("Architecture", RuntimeInformation.ProcessArchitecture),
        Row("Environment", app.Environment.EnvironmentName),
        Row("A5 Request is HTTPS", ctx.Request.IsHttps),
        Row("Host header", ctx.Request.Host.Value),
        Row("Server time (UTC)", DateTime.UtcNow.ToString("u")),
        Row("Server time zone", TimeZoneInfo.Local.Id),
        Row("App folder writable", writable),
        Row("Connection string configured", !string.IsNullOrWhiteSpace(config.GetConnectionString("Default"))),
        Row("SMTP host configured", !string.IsNullOrWhiteSpace(config["Smtp:Host"])));

    return Page("ArchitectCoach hosting probe", $"""
        <table>{rows}</table>
        <h2>Next checks</h2>
        <p><a href="/sql?key={key}">Check SQL Server (A2)</a></p>
        <form method="post" action="/email">
          <input type="hidden" name="key" value="{key}">
          <button type="submit">Send a test email to the configured recipient (A3)</button>
        </form>
        """);
});

app.MapGet("/sql", async (HttpContext ctx) =>
{
    if (!Authorized(ctx)) return Results.NotFound();
    var cs = config.GetConnectionString("Default");
    if (string.IsNullOrWhiteSpace(cs)) return Page("SQL Server check", "<p class=\"bad\">ConnectionStrings:Default is not configured.</p>");

    try
    {
        await using var conn = new SqlConnection(cs);
        await conn.OpenAsync();
        await using var cmd = conn.CreateCommand();
        // OPENJSON needs compatibility level 130+, and EF Core's JSON columns depend on it.
        cmd.CommandText = """
            SELECT CAST(SERVERPROPERTY('ProductVersion') AS nvarchar(64)),
                   CAST(SERVERPROPERTY('Edition') AS nvarchar(128)),
                   (SELECT compatibility_level FROM sys.databases WHERE name = DB_NAME()),
                   DB_NAME(),
                   ISJSON(N'{"a":[1,2]}'),
                   (SELECT COUNT(*) FROM OPENJSON(N'[1,2,3]')),
                   HAS_PERMS_BY_NAME(DB_NAME(), 'DATABASE', 'CREATE TABLE')
            """;
        await using var r = await cmd.ExecuteReaderAsync();
        await r.ReadAsync();
        var compat = r.GetByte(2);
        var rows = string.Concat(
            Row("Product version", r.GetString(0)),
            Row("Edition", r.GetString(1)),
            Row("Database", r.GetString(3)),
            Row("Compatibility level (need 130+)", compat),
            Row("ISJSON works", r.GetInt32(4) == 1),
            Row("OPENJSON works", r.GetInt32(5) == 3),
            Row("Can CREATE TABLE (EF migrations)", r.GetInt32(6) == 1));
        var verdict = compat >= 130
            ? "<p class=\"ok\">OK for EF Core JSON columns.</p>"
            : "<p class=\"bad\">Compatibility level below 130. Ask SmarterASP to raise it, or store JSON as nvarchar(max).</p>";
        return Page("SQL Server check", $"<table>{rows}</table>{verdict}");
    }
    catch (Exception ex)
    {
        // Exception type and message only, never the connection string.
        return Page("SQL Server check", $"<p class=\"bad\">{WebUtility.HtmlEncode(ex.GetType().Name)}: {WebUtility.HtmlEncode(ex.Message)}</p>");
    }
});

app.MapPost("/email", async (HttpContext ctx) =>
{
    await ctx.Request.ReadFormAsync();
    if (!Authorized(ctx)) return Results.NotFound();

    var host = config["Smtp:Host"];
    var to = config["Probe:TestRecipient"];
    var from = config["Smtp:From"];
    if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(to) || string.IsNullOrWhiteSpace(from))
        return Page("Email check", "<p class=\"bad\">Smtp:Host, Smtp:From, and Probe:TestRecipient must all be configured.</p>");

    var port = config.GetValue("Smtp:Port", 587);
    var message = new MimeMessage();
    message.From.Add(MailboxAddress.Parse(from));
    message.To.Add(MailboxAddress.Parse(to));
    message.Subject = "ArchitectCoach hosting probe test";
    message.Body = new TextPart("plain") { Text = $"Test email sent {DateTime.UtcNow:u} UTC from the ArchitectCoach hosting probe." };

    var log = new StringBuilder();
    try
    {
        using var client = new SmtpClient();
        client.Timeout = 20000;
        await client.ConnectAsync(host, port, SecureSocketOptions.Auto);
        log.Append(Row("Connected", $"{host}:{port}"));
        log.Append(Row("TLS", client.IsSecure ? $"yes ({client.SslProtocol})" : "NO: credentials would be sent unencrypted"));
        var user = config["Smtp:User"];
        if (!string.IsNullOrWhiteSpace(user))
        {
            await client.AuthenticateAsync(user, config["Smtp:Password"] ?? "");
            log.Append(Row("Authenticated", "yes"));
        }
        await client.SendAsync(message);
        log.Append(Row("Sent to configured recipient", "yes. Check the inbox AND the spam folder"));
        await client.DisconnectAsync(true);
        return Page("Email check", $"<table>{log}</table>");
    }
    catch (Exception ex)
    {
        log.Append(Row("Failed", $"{ex.GetType().Name}: {ex.Message}"));
        return Page("Email check", $"<table>{log}</table><p class=\"bad\">If the connection failed, try port 465 or 25 and ask SmarterASP which port and server to use.</p>");
    }
});

app.Run();
