using System.Net;
using ArchitectCoach.IntegrationTests.Infrastructure;
using ArchitectCoach.Web.Security;

namespace ArchitectCoach.IntegrationTests;

/// <summary>The real account pages, driven through their HTML forms like a browser.</summary>
public class AccountFlowTests(AppFactory app) : IClassFixture<AppFactory>
{
    private const string Password = "correct-horse-battery";

    private static string NewEmail() => $"user-{Guid.NewGuid():N}@example.test";

    private static Task<HttpResponseMessage> RegisterAsync(HttpClient client, string email, string password = Password) =>
        Forms.SubmitAsync(client, "/Account/Register", "register", new Dictionary<string, string>
        {
            ["Input.Email"] = email,
            ["Input.Password"] = password,
            ["Input.ConfirmPassword"] = password,
            ["Input.AgeConfirmed"] = "true",
        });

    private static Task<HttpResponseMessage> LoginAsync(HttpClient client, string email, string password = Password) =>
        Forms.SubmitAsync(client, "/Account/Login", "login", new Dictionary<string, string>
        {
            ["Input.Email"] = email,
            ["Input.Password"] = password,
        });

    [Fact]
    public async Task Register_confirm_then_sign_in()
    {
        var client = app.NewClient();
        var email = NewEmail();

        var register = await RegisterAsync(client, email);
        Assert.Equal(HttpStatusCode.Redirect, register.StatusCode);
        Assert.Contains("/Account/RegisterConfirmation", register.Headers.Location!.ToString());
        // Personal data never goes in URLs (they end up in logs and browser history).
        Assert.DoesNotContain("example.test", Uri.UnescapeDataString(register.Headers.Location!.ToString()));

        // Not confirmed yet: sign-in must fail.
        var early = await LoginAsync(client, email);
        Assert.NotEqual(HttpStatusCode.Redirect, early.StatusCode);
        Assert.Equal(HttpStatusCode.Redirect, (await client.GetAsync("/Account/Manage")).StatusCode);

        var message = Assert.Single(app.Mail.To(email));
        var confirm = await client.GetAsync(Forms.FirstLinkPath(message.TextBody ?? ""));
        Assert.Equal(HttpStatusCode.OK, confirm.StatusCode);
        Assert.Contains("Thank you for confirming your email", await confirm.Content.ReadAsStringAsync());

        var login = await LoginAsync(client, email);
        Assert.Equal(HttpStatusCode.Redirect, login.StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/Account/Manage")).StatusCode);

        // Privacy: the whole sign-up flow never wrote the email or password to the logs.
        Assert.NotEmpty(app.Logs.Messages);
        Assert.DoesNotContain(app.Logs.Messages, m => m.Contains(email, StringComparison.OrdinalIgnoreCase));
        Assert.DoesNotContain(app.Logs.Messages, m => m.Contains(Password));
    }

    [Fact]
    public async Task Registration_requires_confirming_age_16_or_older()
    {
        var email = NewEmail();
        var response = await Forms.SubmitAsync(app.NewClient(), "/Account/Register", "register", new Dictionary<string, string>
        {
            ["Input.Email"] = email,
            ["Input.Password"] = Password,
            ["Input.ConfirmPassword"] = Password,
        });
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains("16 or older", await response.Content.ReadAsStringAsync());
        Assert.Empty(app.Mail.To(email));
    }

    [Fact]
    public async Task Registering_an_existing_email_looks_identical_and_sends_nothing()
    {
        var email = NewEmail();
        await app.CreateConfirmedUserAsync(email, Password);

        var response = await RegisterAsync(app.NewClient(), email);
        Assert.Equal(HttpStatusCode.Redirect, response.StatusCode);
        Assert.Contains("/Account/RegisterConfirmation", response.Headers.Location!.ToString());
        Assert.Empty(app.Mail.To(email));
    }

    [Fact]
    public async Task Short_passwords_are_rejected()
    {
        var email = NewEmail();
        var response = await RegisterAsync(app.NewClient(), email, "short-pass1");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode); // form re-rendered with an error
        Assert.Contains("at least 12 characters", await response.Content.ReadAsStringAsync());
        Assert.Empty(app.Mail.To(email));
    }

    [Fact]
    public async Task Five_wrong_passwords_lock_the_account()
    {
        var email = NewEmail();
        await app.CreateConfirmedUserAsync(email, Password);
        var client = app.NewClient();

        for (var i = 0; i < 5; i++)
            await LoginAsync(client, email, "wrong-password-123");

        var correct = await LoginAsync(client, email);
        Assert.Equal(HttpStatusCode.Redirect, correct.StatusCode);
        Assert.Contains("/Account/Lockout", correct.Headers.Location!.ToString());
    }

    [Fact]
    public async Task Pages_send_security_headers()
    {
        var response = await app.NewClient().GetAsync("/Account/Login");
        Assert.Equal(SecurityHeaders.ContentSecurityPolicy, response.Headers.GetValues("Content-Security-Policy").Single());
        Assert.Equal("nosniff", response.Headers.GetValues("X-Content-Type-Options").Single());
        Assert.Equal("DENY", response.Headers.GetValues("X-Frame-Options").Single());
    }

    [Fact]
    public async Task Auth_cookie_is_http_only()
    {
        var email = NewEmail();
        await app.CreateConfirmedUserAsync(email, Password);
        var login = await LoginAsync(app.NewClient(), email);
        var cookie = login.Headers.GetValues("Set-Cookie").Single(c => c.StartsWith(".AspNetCore.Identity.Application"));
        Assert.Contains("httponly", cookie, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("samesite=lax", cookie, StringComparison.OrdinalIgnoreCase);
    }
}

public class RateLimitFactory : AppFactory
{
    protected override int AccountPostsPerMinute => 3;
}

public class RateLimitTests(RateLimitFactory app) : IClassFixture<RateLimitFactory>
{
    [Fact]
    public async Task Account_posts_beyond_the_limit_get_429()
    {
        var client = app.NewClient();
        var statuses = new List<HttpStatusCode>();
        for (var i = 0; i < 4; i++)
        {
            var response = await Forms.SubmitAsync(client, "/Account/Login", "login", new Dictionary<string, string>
            {
                ["Input.Email"] = "nobody@example.test",
                ["Input.Password"] = "wrong-password-123",
            });
            statuses.Add(response.StatusCode);
        }
        Assert.DoesNotContain(HttpStatusCode.TooManyRequests, statuses.Take(3));
        Assert.Equal(HttpStatusCode.TooManyRequests, statuses[3]);
    }
}
