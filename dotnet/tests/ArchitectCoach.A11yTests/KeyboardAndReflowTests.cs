using Microsoft.Playwright;

namespace ArchitectCoach.A11yTests;

/// <summary>
/// Checks axe can't do: real keyboard use (WCAG 2.1.1, 2.4.1, 2.4.7) and reflow at 320 px
/// wide, the equivalent of 400% zoom (1.4.10).
/// </summary>
public class KeyboardAndReflowTests(BrowserFixture fx) : IClassFixture<BrowserFixture>
{
    private const string FocusableSelector =
        "a[href], button:not([disabled]), input:not([type=hidden]):not([disabled]), select, textarea, summary";

    [Fact]
    public async Task Skip_link_is_first_visible_on_focus_and_moves_to_main()
    {
        var page = await fx.NewPageAsync(signedIn: true);
        await page.GotoAsync($"/projects/{fx.ArchitectureStepId}/interview");

        // Pages focus their h1 on load (FocusOnNavigate) so screen readers announce them; the skip
        // link must still be the first stop in tab order for anyone starting from the top.
        var first = await page.EvaluateAsync<string>($"() => [...document.querySelectorAll('{FocusableSelector}')][0].textContent.trim()");
        Assert.Equal("Skip to main content", first);

        await page.FocusAsync(".skip-link");
        var left = await page.EvaluateAsync<double>("() => document.activeElement.getBoundingClientRect().left");
        Assert.True(left >= 0, "Skip link must be on screen when focused.");

        await page.Keyboard.PressAsync("Enter");
        Assert.EndsWith("#main", page.Url);
    }

    [Theory]
    [InlineData("interview")]
    [InlineData("")]
    public async Task Every_control_is_reachable_by_tab_and_shows_a_focus_indicator(string sub)
    {
        var page = await fx.NewPageAsync(signedIn: true);
        await page.GotoAsync($"/projects/{fx.ArchitectureStepId}/{sub}");
        await page.EvaluateAsync("() => document.querySelectorAll('details').forEach(d => d.open = true)");

        var expected = await page.EvaluateAsync<int>($$"""
            () => [...document.querySelectorAll('{{FocusableSelector}}')]
                .filter(e => e.offsetParent !== null || e.classList.contains('skip-link')).length
            """);

        // Start from the top of the page (the skip link), then Tab through everything.
        await page.FocusAsync(".skip-link");
        var reached = new HashSet<string>();
        var missingIndicator = new List<string>();
        for (var i = 0; i < expected + 5; i++)
        {
            if (i > 0) await page.Keyboard.PressAsync("Tab");
            var info = await page.EvaluateAsync<string[]>("""
                () => {
                    const e = document.activeElement;
                    if (!e || e === document.body) return ['', 'none'];
                    const cs = getComputedStyle(e);
                    const id = [...document.querySelectorAll('*')].indexOf(e) + '|' + e.tagName + '|' + e.textContent.trim().slice(0, 40);
                    const visible = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== 'none';
                    return [id, visible ? 'yes' : 'no'];
                }
                """);
            if (info[0].Length == 0) continue;
            reached.Add(info[0]);
            if (info[1] == "no") missingIndicator.Add(info[0]);
        }

        Assert.True(reached.Count >= expected, $"Only {reached.Count} of {expected} focusable controls were reachable by Tab.");
        Assert.True(missingIndicator.Count == 0, "No visible focus indicator on: " + string.Join("; ", missingIndicator.Distinct()));
    }

    [Theory]
    [InlineData(false, "/")]
    [InlineData(false, "/privacy")]
    [InlineData(false, "/Account/Register")]
    [InlineData(true, "/projects")]
    [InlineData(true, "interview")]
    [InlineData(true, "architecture")]
    [InlineData(true, "decisions")]
    public async Task Pages_reflow_at_320_px_without_horizontal_scrolling(bool signedIn, string path)
    {
        var page = await fx.NewPageAsync(signedIn);
        await page.SetViewportSizeAsync(320, 640);
        var url = path.StartsWith('/') ? path : $"/projects/{(path == "decisions" ? fx.FinishedProjectId : fx.ArchitectureStepId)}/{path}";
        await page.GotoAsync(url);
        await page.EvaluateAsync("() => document.querySelectorAll('details').forEach(d => d.open = true)");

        // Data tables may scroll inside their own box (allowed by WCAG 1.4.10); the page itself may not.
        var overflow = await page.EvaluateAsync<string[]>("""
            () => [...document.querySelectorAll('body *')]
                .filter(e => !e.closest('.table-responsive') && e.getBoundingClientRect().right > window.innerWidth + 1)
                .slice(0, 5)
                .map(e => e.tagName + '.' + e.className + ' right=' + Math.round(e.getBoundingClientRect().right))
            """);
        var pageWidth = await page.EvaluateAsync<int>("() => document.documentElement.scrollWidth");
        Assert.True(pageWidth <= 320 && overflow.Length == 0, $"{url} scrolls horizontally at 320px (width {pageWidth}): {string.Join("; ", overflow)}");
    }
}
