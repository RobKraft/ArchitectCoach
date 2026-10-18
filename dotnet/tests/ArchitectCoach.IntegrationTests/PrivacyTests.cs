using System.Net;
using System.Text.Json;
using System.Text.RegularExpressions;
using ArchitectCoach.IntegrationTests.Infrastructure;
using ArchitectCoach.Web.Data;
using ArchitectCoach.Web.Domain;
using ArchitectCoach.Web.Services.Privacy;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace ArchitectCoach.IntegrationTests;

/// <summary>
/// GDPR/CCPA features (docs/plans/dotnet-blazor-rewrite.md §7): export, deletion, retention,
/// and the public notices.
/// </summary>
public partial class PrivacyTests(AppFactory app) : IClassFixture<AppFactory>
{
    private const string Password = "correct-horse-battery";

    private async Task<(HttpClient Client, string UserId, string Email)> SignedInAsync(string name)
    {
        var email = $"{name}-{Guid.NewGuid():N}@example.test";
        var userId = await app.CreateConfirmedUserAsync(email, Password);
        var client = app.NewClient();
        var login = await Forms.SubmitAsync(client, "/Account/Login", "login", new Dictionary<string, string>
        {
            ["Input.Email"] = email,
            ["Input.Password"] = Password,
        });
        Assert.Equal(HttpStatusCode.Redirect, login.StatusCode);
        return (client, userId, email);
    }

    private async Task<Guid> SeedProjectAsync(string userId, string purpose)
    {
        await using var db = app.NewDbContext(userId);
        var project = new Project { ProjectType = "Static website", Purpose = purpose };
        project.Knowledge.Requirements.Purpose = purpose;
        db.Projects.Add(project);
        db.Decisions.Add(new DecisionRecord { ProjectId = project.Id, Number = 1, Title = $"Decision for {purpose}", Section = DecisionSection.Technology, Decision = "Netlify" });
        await db.SaveChangesAsync();
        return project.Id;
    }

    private static async Task<string> TokenFromAsync(HttpClient client, string url)
    {
        var html = await (await client.GetAsync(url)).Content.ReadAsStringAsync();
        return WebUtility.HtmlDecode(TokenRegex().Match(html).Groups[1].Value);
    }

    [Fact]
    public async Task Export_contains_my_account_and_projects_but_no_secrets_or_other_users_data()
    {
        var (client, userId, email) = await SignedInAsync("exporter");
        await SeedProjectAsync(userId, "My first project");
        await SeedProjectAsync(userId, "My second project");
        var (_, otherId, _) = await SignedInAsync("other");
        await SeedProjectAsync(otherId, "Someone else's project");

        var token = await TokenFromAsync(client, "/Account/Manage/PersonalData");
        var response = await client.PostAsync("/Account/Manage/DownloadPersonalData",
            new FormUrlEncodedContent(new Dictionary<string, string> { ["__RequestVerificationToken"] = token }));
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("application/json", response.Content.Headers.ContentType!.MediaType);
        Assert.Contains("no-store", response.Headers.CacheControl!.ToString());

        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        Assert.Equal(email, doc.RootElement.GetProperty("account").GetProperty("email").GetString());
        Assert.Equal(2, doc.RootElement.GetProperty("projects").GetArrayLength());
        Assert.Contains("My first project", json);
        Assert.Contains("Decision for My second project", json);

        Assert.DoesNotContain("Someone else", json);

        // The user's real secrets must not be in the file, under any name.
        await using var db = app.NewDbContext(userId);
        var stored = await db.Users.SingleAsync(u => u.Id == userId);
        Assert.False(string.IsNullOrEmpty(stored.PasswordHash));
        Assert.DoesNotContain(stored.PasswordHash!, json);
        Assert.DoesNotContain(stored.SecurityStamp!, json);
        foreach (var field in new[] { "\"PasswordHash\"", "\"SecurityStamp\"", "\"ConcurrencyStamp\"", "\"AuthenticatorKey\"" })
            Assert.DoesNotContain(field, json, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Owner_can_delete_a_project_only_after_confirming()
    {
        var (client, userId, _) = await SignedInAsync("deleter");
        var id = await SeedProjectAsync(userId, "Delete me");

        // Without the confirmation box: nothing happens.
        var unconfirmed = await Forms.SubmitAsync(client, $"/projects/{id}", "delete-project", new Dictionary<string, string>());
        Assert.Equal(HttpStatusCode.OK, unconfirmed.StatusCode);
        await using (var db = app.NewDbContext(userId))
            Assert.True(await db.Projects.AnyAsync(p => p.Id == id));

        var confirmed = await Forms.SubmitAsync(client, $"/projects/{id}", "delete-project", new Dictionary<string, string> { ["ConfirmDelete"] = "true" });
        Assert.Equal(HttpStatusCode.Redirect, confirmed.StatusCode);
        await using var check = app.NewDbContext(userId);
        Assert.False(await check.Projects.IgnoreQueryFilters().AnyAsync(p => p.Id == id));
        Assert.False(await check.Decisions.IgnoreQueryFilters().AnyAsync(d => d.ProjectId == id));
    }

    [Fact]
    public async Task Another_user_cannot_delete_my_project()
    {
        var (_, aliceId, _) = await SignedInAsync("alice");
        var id = await SeedProjectAsync(aliceId, "Alice keeps this");
        var (bob, _, _) = await SignedInAsync("bob");
        var token = await TokenFromAsync(bob, "/projects");

        async Task<HttpStatusCode> Post(Guid target) => (await bob.PostAsync($"/projects/{target}", new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["__RequestVerificationToken"] = token,
            ["_handler"] = "delete-project",
            ["ConfirmDelete"] = "true",
        }))).StatusCode;

        var status = await Post(id);
        Assert.True(status is HttpStatusCode.NotFound or HttpStatusCode.BadRequest, $"got {(int)status}");
        Assert.Equal(await Post(Guid.NewGuid()), status);

        await using var db = app.NewDbContext(aliceId);
        Assert.True(await db.Projects.AnyAsync(p => p.Id == id));
    }

    [Fact]
    public async Task Deleting_my_account_removes_everything_and_signs_me_out()
    {
        var (client, userId, email) = await SignedInAsync("leaver");
        var id = await SeedProjectAsync(userId, "Gone with the account");

        var response = await Forms.SubmitAsync(client, "/Account/Manage/DeletePersonalData", "delete-user",
            new Dictionary<string, string> { ["Input.Password"] = Password });
        Assert.Equal(HttpStatusCode.Redirect, response.StatusCode);

        await using var db = app.NewDbContext(userId);
        Assert.False(await db.Users.AnyAsync(u => u.Id == userId));
        Assert.False(await db.Users.AnyAsync(u => u.Email == email));
        Assert.False(await db.Projects.IgnoreQueryFilters().AnyAsync(p => p.Id == id));

        var after = await client.GetAsync("/projects");
        Assert.Equal(HttpStatusCode.Redirect, after.StatusCode);
        Assert.Contains("/Account/Login", after.Headers.Location!.ToString());
    }

    [Fact]
    public async Task Unconfirmed_accounts_older_than_seven_days_are_deleted()
    {
        string old, recent, confirmedOld;
        await using (var db = app.NewDbContext(null))
        {
            ApplicationUser Make(bool confirmed, int ageDays)
            {
                var email = $"ret-{Guid.NewGuid():N}@example.test";
                return new ApplicationUser
                {
                    UserName = email, NormalizedUserName = email.ToUpperInvariant(),
                    Email = email, NormalizedEmail = email.ToUpperInvariant(),
                    EmailConfirmed = confirmed, SecurityStamp = Guid.NewGuid().ToString(),
                    CreatedAt = DateTime.UtcNow.AddDays(-ageDays),
                };
            }
            var users = new[] { Make(false, 8), Make(false, 1), Make(true, 30) };
            db.Users.AddRange(users);
            await db.SaveChangesAsync();
            (old, recent, confirmedOld) = (users[0].Id, users[1].Id, users[2].Id);
        }

        using (var scope = app.Services.CreateScope())
            await scope.ServiceProvider.GetRequiredService<RetentionService>().DeleteExpiredUnconfirmedAccountsAsync(DateTime.UtcNow);

        await using var check = app.NewDbContext(null);
        Assert.False(await check.Users.AnyAsync(u => u.Id == old));
        Assert.True(await check.Users.AnyAsync(u => u.Id == recent));
        Assert.True(await check.Users.AnyAsync(u => u.Id == confirmedOld));
    }

    [Fact]
    public async Task Privacy_and_accessibility_pages_are_public()
    {
        var client = app.NewClient();
        var privacy = await client.GetAsync("/privacy");
        Assert.Equal(HttpStatusCode.OK, privacy.StatusCode);
        var privacyHtml = WebUtility.HtmlDecode(await privacy.Content.ReadAsStringAsync());
        foreach (var needle in new[] { "never sell or share", "Your rights", "16 or older", "Legal basis", "[not yet configured]" })
            Assert.Contains(needle, privacyHtml);

        var a11y = await client.GetAsync("/accessibility");
        Assert.Equal(HttpStatusCode.OK, a11y.StatusCode);
        Assert.Contains("WCAG 2.2", await a11y.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task Profile_page_no_longer_offers_a_phone_number()
    {
        var (client, _, _) = await SignedInAsync("profile");
        var html = await (await client.GetAsync("/Account/Manage")).Content.ReadAsStringAsync();
        Assert.DoesNotContain("PhoneNumber", html);
        Assert.DoesNotContain("Phone number", html);
    }

    [GeneratedRegex("name=\"__RequestVerificationToken\" value=\"([^\"]+)\"")]
    private static partial Regex TokenRegex();
}
