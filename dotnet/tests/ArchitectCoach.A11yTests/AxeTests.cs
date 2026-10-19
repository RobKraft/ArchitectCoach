using System.Text;
using Deque.AxeCore.Commons;
using Deque.AxeCore.Playwright;
using Microsoft.Playwright;

namespace ArchitectCoach.A11yTests;

/// <summary>
/// WCAG 2.2 AA automated checks (axe-core) on every page, signed out and signed in, with every
/// &lt;details&gt; expanded so collapsed content (tradeoffs, deep dives) is checked too.
/// Automated checks catch roughly a third of issues; the manual pass in the plan (§8) still applies.
/// </summary>
public class AxeTests(BrowserFixture fx) : IClassFixture<BrowserFixture>
{
    private static readonly AxeRunOptions WcagAa = new()
    {
        RunOnly = new RunOnlyOptions { Type = "tag", Values = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
    };

    private static async Task<string> ScanAsync(IPage page, string url)
    {
        var response = await page.GotoAsync(url);

        // Guard: scanning an unstyled page (CSS failed to load) would make the results meaningless.
        var styledRules = await page.EvaluateAsync<int>("() => [...document.styleSheets].reduce((n, s) => { try { return n + s.cssRules.length } catch { return n } }, 0)");
        Assert.True(styledRules > 1000, $"{url}: stylesheets didn't load ({styledRules} CSS rules), so the scan would be meaningless.");

        await page.EvaluateAsync("() => document.querySelectorAll('details').forEach(d => d.open = true)");
        var result = await page.RunAxe(WcagAa);
        if (result.Violations.Length == 0) return "";

        var sb = new StringBuilder($"\n{url} (HTTP {response?.Status}):\n");
        foreach (var v in result.Violations)
        {
            sb.AppendLine($"  [{v.Impact}] {v.Id}: {v.Help}");
            foreach (var node in v.Nodes.Take(3))
                sb.AppendLine($"      {node.Target}  {node.Html[..Math.Min(140, node.Html.Length)]}");
        }
        return sb.ToString();
    }

    private static async Task AssertNoViolationsAsync(IPage page, IEnumerable<string> urls)
    {
        var report = new StringBuilder();
        foreach (var url in urls) report.Append(await ScanAsync(page, url));
        Assert.True(report.Length == 0, "Accessibility violations:" + report);
    }

    [Fact]
    public async Task Public_pages_have_no_wcag_aa_violations()
    {
        var page = await fx.NewPageAsync(signedIn: false);
        await AssertNoViolationsAsync(page,
        [
            "/", "/privacy", "/accessibility", "/Account/Login", "/Account/Register",
            "/Account/RegisterConfirmation", "/Account/ForgotPassword", "/Account/ResendEmailConfirmation",
            "/Account/Lockout", "/not-found",
        ]);
    }

    [Fact]
    public async Task Signed_in_pages_have_no_wcag_aa_violations()
    {
        var page = await fx.NewPageAsync(signedIn: true);
        string P(Guid id, string sub = "") => $"/projects/{id}{sub}";
        await AssertNoViolationsAsync(page,
        [
            "/", "/projects",
            P(fx.NewProjectId), P(fx.NewProjectId, "/interview"), P(fx.NewProjectId, "/requirements"),
            P(fx.ArchitectureStepId, "/interview"), P(fx.ArchitectureStepId, "/architecture"), P(fx.ArchitectureStepId, "/technology"),
            P(fx.FinishedProjectId), P(fx.FinishedProjectId, "/interview"), P(fx.FinishedProjectId, "/decisions"),
            P(fx.FinishedProjectId, "/decisions/1"),
            "/Account/Manage", "/Account/Manage/Email", "/Account/Manage/ChangePassword",
            "/Account/Manage/TwoFactorAuthentication", "/Account/Manage/Passkeys",
            "/Account/Manage/PersonalData", "/Account/Manage/DeletePersonalData",
            "/this-page-does-not-exist",
        ]);
    }

    [Fact]
    public async Task Unknown_urls_get_a_real_404_page_when_signed_in()
    {
        // Signed out, unknown URLs redirect to sign-in (the fallback policy covers requests that
        // match no endpoint), which avoids revealing which URLs exist.
        var page = await fx.NewPageAsync(signedIn: true);
        var response = await page.GotoAsync("/this-page-does-not-exist");
        Assert.Equal(404, response!.Status);
        Assert.Equal("Page not found · ArchitectCoach", await page.TitleAsync());
    }
}
