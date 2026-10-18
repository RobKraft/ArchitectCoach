using System.Net;
using System.Text.RegularExpressions;
using ArchitectCoach.IntegrationTests.Infrastructure;
using ArchitectCoach.Web.Content;
using ArchitectCoach.Web.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace ArchitectCoach.IntegrationTests;

/// <summary>
/// Two real users over HTTP. Bob tries every way to reach Alice's project, including requests a
/// browser UI would never make; each must behave as if the project doesn't exist.
/// </summary>
public partial class ProjectAccessTests(AppFactory app) : IClassFixture<AppFactory>
{
    private const string Password = "correct-horse-battery";
    private ContentCatalog Content => app.Services.GetRequiredService<ContentCatalog>();

    private async Task<(HttpClient Client, string UserId)> SignedInAsync(string name)
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
        return (client, userId);
    }

    private static async Task<Guid> CreateProjectAsync(HttpClient client, string type, string purpose, IDictionary<string, string>? extra = null)
    {
        var fields = new Dictionary<string, string> { ["ProjectType"] = type, ["Purpose"] = purpose };
        foreach (var (k, v) in extra ?? new Dictionary<string, string>()) fields[k] = v;
        var response = await Forms.SubmitAsync(client, "/projects", "new-project", fields);
        Assert.Equal(HttpStatusCode.Redirect, response.StatusCode);
        var match = ProjectIdRegex().Match(response.Headers.Location!.ToString());
        Assert.True(match.Success, $"unexpected redirect {response.Headers.Location}");
        return Guid.Parse(match.Groups[1].Value);
    }

    private static Task<HttpResponseMessage> AnswerAsync(HttpClient client, Guid projectId, string optionId) =>
        Forms.SubmitAsync(client, $"/projects/{projectId}/interview", "answer", new Dictionary<string, string> { ["OptionId"] = optionId });

    private static string[] ProjectPages(Guid id) =>
    [
        $"/projects/{id}", $"/projects/{id}/interview", $"/projects/{id}/requirements",
        $"/projects/{id}/architecture", $"/projects/{id}/technology", $"/projects/{id}/decisions",
        $"/projects/{id}/decisions/1",
    ];

    /// <summary>Alice's Static website project, answered far enough to have decision #1.</summary>
    private async Task<(HttpClient Alice, string AliceId, Guid ProjectId)> AliceWithProjectAsync()
    {
        var (alice, aliceId) = await SignedInAsync("alice");
        var id = await CreateProjectAsync(alice, "Static website", "Alice's secret portfolio");
        foreach (var _ in Content.StepsFor("Static website").TakeWhile(s => s.RecordDecision is null).Append(null))
            Assert.Equal(HttpStatusCode.Redirect, (await AnswerAsync(alice, id, "0")).StatusCode);
        return (alice, aliceId, id);
    }

    [Fact]
    public async Task Owner_can_open_every_project_page()
    {
        var (alice, _, id) = await AliceWithProjectAsync();
        foreach (var page in ProjectPages(id))
            Assert.True((await alice.GetAsync(page)).StatusCode == HttpStatusCode.OK, $"{page} not OK for its owner");
    }

    [Fact]
    public async Task Another_user_gets_404_on_every_project_page()
    {
        var (_, _, id) = await AliceWithProjectAsync();
        var (bob, _) = await SignedInAsync("bob");
        foreach (var page in ProjectPages(id))
        {
            var response = await bob.GetAsync(page);
            Assert.True(response.StatusCode == HttpStatusCode.NotFound, $"{page} returned {(int)response.StatusCode} to another user");
            Assert.DoesNotContain("Alice's secret portfolio", WebUtility.HtmlDecode(await response.Content.ReadAsStringAsync()));
        }
    }

    [Fact]
    public async Task Another_user_cannot_answer_the_wizard_even_with_a_valid_antiforgery_token()
    {
        var (_, aliceId, id) = await AliceWithProjectAsync();
        int stepBefore;
        await using (var db = app.NewDbContext(aliceId))
            stepBefore = (await db.Projects.SingleAsync(p => p.Id == id)).StepIndex;

        // Bob takes a genuine token from one of his own pages, then posts straight at Alice's project.
        var (bob, _) = await SignedInAsync("bob");
        var ownPage = await (await bob.GetAsync("/projects")).Content.ReadAsStringAsync();
        var token = WebUtility.HtmlDecode(TokenRegex().Match(ownPage).Groups[1].Value);
        Assert.False(string.IsNullOrEmpty(token));

        var step = Content.StepsFor("Static website")[stepBefore];
        Task<HttpResponseMessage> PostAnswer(Guid projectId) =>
            bob.PostAsync($"/projects/{projectId}/interview", new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["__RequestVerificationToken"] = token,
                ["_handler"] = "answer",
                ["StepId"] = step.Id,
                ["OptionId"] = "1",
            }));

        // Rejected (the form isn't rendered for him, so Blazor refuses the post), and the response
        // is identical to posting at a project that doesn't exist: no way to probe for ids.
        var response = await PostAnswer(id);
        var missing = await PostAnswer(Guid.NewGuid());
        Assert.True(response.StatusCode is HttpStatusCode.NotFound or HttpStatusCode.BadRequest, $"got {(int)response.StatusCode}");
        Assert.Equal(missing.StatusCode, response.StatusCode);

        await using var check = app.NewDbContext(aliceId);
        var project = await check.Projects.Include(p => p.Decisions).SingleAsync(p => p.Id == id);
        Assert.Equal(stepBefore, project.StepIndex);
        Assert.Single(project.Decisions);
    }

    [Fact]
    public async Task Project_list_shows_only_your_own_projects()
    {
        var (_, _, _) = await AliceWithProjectAsync();
        var (bob, _) = await SignedInAsync("bob");
        await CreateProjectAsync(bob, "Phone app", "Bob's app");
        var html = WebUtility.HtmlDecode(await (await bob.GetAsync("/projects")).Content.ReadAsStringAsync());
        Assert.Contains("Bob's app", html);
        Assert.DoesNotContain("Alice's secret portfolio", html);
    }

    [Fact]
    public async Task Posting_an_owner_id_is_ignored()
    {
        var (_, aliceId, _) = await AliceWithProjectAsync();
        var (bob, bobId) = await SignedInAsync("bob");
        var id = await CreateProjectAsync(bob, "Desktop app", "Planted", new Dictionary<string, string> { ["OwnerId"] = aliceId });

        await using var db = app.NewDbContext(bobId);
        Assert.Equal(bobId, (await db.Projects.SingleAsync(p => p.Id == id)).OwnerId);
        await using var aliceDb = app.NewDbContext(aliceId);
        Assert.False(await aliceDb.Projects.AnyAsync(p => p.Id == id));
    }

    [Fact]
    public async Task Answering_a_stale_step_changes_nothing()
    {
        var (alice, aliceId, id) = await AliceWithProjectAsync();
        var firstStep = Content.StepsFor("Static website")[0];

        // Re-post the first question, already answered.
        var page = await (await alice.GetAsync($"/projects/{id}/interview")).Content.ReadAsStringAsync();
        var token = WebUtility.HtmlDecode(TokenRegex().Match(page).Groups[1].Value);
        var response = await alice.PostAsync($"/projects/{id}/interview", new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["__RequestVerificationToken"] = token,
            ["_handler"] = "answer",
            ["StepId"] = firstStep.Id,
            ["OptionId"] = "2",
        }));
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains("already answered", await response.Content.ReadAsStringAsync());

        await using var db = app.NewDbContext(aliceId);
        var project = await db.Projects.SingleAsync(p => p.Id == id);
        Assert.DoesNotContain(firstStep.Options[2].Label, project.Knowledge.Requirements.Users);
    }

    [Theory]
    [InlineData("Static website")]
    [InlineData("Static site with a blog")]
    [InlineData("Site with a backend/database")]
    [InlineData("Phone app")]
    [InlineData("Desktop app")]
    public async Task Complete_wizard_over_http(string type)
    {
        var (client, userId) = await SignedInAsync("walker");
        var id = await CreateProjectAsync(client, type, "End-to-end run");
        var steps = Content.StepsFor(type);

        for (var i = 0; i < steps.Count; i++)
        {
            var page = await (await client.GetAsync($"/projects/{id}/interview")).Content.ReadAsStringAsync();
            Assert.Contains(steps[i].Question, WebUtility.HtmlDecode(page));
            if (Content.AssessmentsFor(steps[i].Id) is not null)
                Assert.Contains("Compare the options at a glance", page);
            Assert.Equal(HttpStatusCode.Redirect, (await AnswerAsync(client, id, "1")).StatusCode);
        }

        var done = await (await client.GetAsync($"/projects/{id}/interview")).Content.ReadAsStringAsync();
        Assert.Contains("You've answered every question", done);

        await using var db = app.NewDbContext(userId);
        var project = await db.Projects.Include(p => p.Decisions).SingleAsync(p => p.Id == id);
        Assert.Equal(steps.Count, project.StepIndex);
        Assert.Equal(steps.Count(s => s.RecordDecision is not null), project.Decisions.Count);
        Assert.Equal(Enumerable.Range(1, project.Decisions.Count), project.Decisions.Select(d => d.Number).Order());
    }

    [GeneratedRegex(@"projects/([0-9a-f\-]{36})/interview")]
    private static partial Regex ProjectIdRegex();

    [GeneratedRegex("name=\"__RequestVerificationToken\" value=\"([^\"]+)\"")]
    private static partial Regex TokenRegex();
}
