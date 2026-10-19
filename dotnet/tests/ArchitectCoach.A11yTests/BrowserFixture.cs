using ArchitectCoach.IntegrationTests.Infrastructure;
using ArchitectCoach.Web.Content;
using ArchitectCoach.Web.Domain;
using ArchitectCoach.Web.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Playwright;

namespace ArchitectCoach.A11yTests;

/// <summary>
/// The real app on a real port (Kestrel, throwaway LocalDB database) plus a headless Microsoft
/// Edge driven by Playwright. Edge is already installed on Windows, so no browser download is
/// needed. Seeds one signed-in user with projects in every state the pages can show.
/// </summary>
public sealed class BrowserFixture : IAsyncLifetime
{
    public const string Password = "correct-horse-battery";

    public AppFactory App { get; } = new BrowserAppFactory();
    public string BaseUrl { get; private set; } = "";
    public string Email { get; } = $"a11y-{Guid.NewGuid():N}@example.test";

    public Guid NewProjectId { get; private set; }        // nothing answered
    public Guid ArchitectureStepId { get; private set; }  // on a step with compare table + deep dives
    public Guid FinishedProjectId { get; private set; }   // interview complete, decisions recorded

    private IPlaywright? _playwright;
    public IBrowser Browser { get; private set; } = default!;

    public async Task InitializeAsync()
    {
        App.UseKestrel(0);
        App.StartServer();
        BaseUrl = App.ClientOptions.BaseAddress.ToString().TrimEnd('/');
        await App.InitializeAsync();

        var userId = await App.CreateConfirmedUserAsync(Email, Password);
        await SeedAsync(userId);

        _playwright = await Playwright.CreateAsync();
        Browser = await _playwright.Chromium.LaunchAsync(new() { Channel = "msedge", Headless = true });
    }

    private async Task SeedAsync(string userId)
    {
        var content = App.Services.GetRequiredService<ContentCatalog>();
        await using var db = App.NewDbContext(userId);

        Project Make(string type, string purpose, int answered)
        {
            var p = new Project { ProjectType = type, Purpose = purpose, StepIndex = answered };
            p.Knowledge.Requirements.Purpose = purpose;
            var number = 0;
            foreach (var step in content.StepsFor(type).Take(answered))
            {
                var option = step.Options[0];
                WizardService.ApplyToKnowledge(p.Knowledge, step, option.Label);
                if (step.RecordDecision is { } spec)
                {
                    var d = WizardService.BuildDecision(step, spec, option, ++number);
                    d.ProjectId = p.Id;
                    db.Decisions.Add(d);
                }
            }
            db.Projects.Add(p);
            return p;
        }

        var siteSteps = content.StepsFor("Site with a backend/database");
        NewProjectId = Make("Phone app", "Brand new", 0).Id;
        ArchitectureStepId = Make("Site with a backend/database", "Mid-interview", siteSteps.ToList().FindIndex(s => s.Topic == "architecture")).Id;
        FinishedProjectId = Make("Static website", "All done", content.StepsFor("Static website").Count).Id;
        await db.SaveChangesAsync();
    }

    /// <summary>A fresh browser context, optionally signed in through the real login form.</summary>
    public async Task<IPage> NewPageAsync(bool signedIn)
    {
        var context = await Browser.NewContextAsync(new() { BaseURL = BaseUrl });
        var page = await context.NewPageAsync();
        if (signedIn)
        {
            await page.GotoAsync("/Account/Login");
            await page.FillAsync("#Input\\.Email", Email);
            await page.FillAsync("#Input\\.Password", Password);
            await page.ClickAsync("main button[type=submit]:has-text('Log in')");
            await page.WaitForURLAsync(url => !url.Contains("/Account/Login"));
        }
        return page;
    }

    public async Task DisposeAsync()
    {
        if (Browser is not null) await Browser.CloseAsync();
        _playwright?.Dispose();
        await ((IAsyncLifetime)App).DisposeAsync();
    }
}

/// <summary>
/// Static web assets (CSS, blazor.web.js, scoped files) are only wired up automatically in the
/// Development environment; the browser needs them, so enable them for the Testing host too.
/// Without this every page is scanned unstyled and the results are meaningless.
/// </summary>
public sealed class BrowserAppFactory : AppFactory
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        base.ConfigureWebHost(builder);
        builder.UseStaticWebAssets();
    }
}
