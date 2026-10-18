using System.Net;
using System.Text.RegularExpressions;

namespace ArchitectCoach.IntegrationTests.Infrastructure;

/// <summary>
/// Submits a page's real HTML form the way a browser would: GET the page, copy the form's hidden
/// fields (antiforgery token, Blazor's _handler), add the visible fields, POST it back.
/// </summary>
public static partial class Forms
{
    public static async Task<HttpResponseMessage> SubmitAsync(HttpClient client, string url, string formName, IDictionary<string, string> fields)
    {
        var page = await client.GetAsync(url);
        var html = await page.Content.ReadAsStringAsync();
        if (page.StatusCode != HttpStatusCode.OK)
            throw new InvalidOperationException($"GET {url} returned {(int)page.StatusCode}, expected a form page.");

        var form = FormRegex().Matches(html).Select(m => m.Value)
            .FirstOrDefault(f => f.Contains($"name=\"_handler\" value=\"{formName}\""))
            ?? throw new InvalidOperationException($"No form named '{formName}' on {url}.");

        var values = new Dictionary<string, string>();
        foreach (Match input in HiddenInputRegex().Matches(form))
        {
            var name = AttrRegex("name").Match(input.Value).Groups[1].Value;
            var value = AttrRegex("value").Match(input.Value).Groups[1].Value;
            if (name.Length > 0) values[name] = WebUtility.HtmlDecode(value);
        }
        foreach (var (k, v) in fields) values[k] = v;

        return await client.PostAsync(url, new FormUrlEncodedContent(values));
    }

    /// <summary>The relative path+query of an absolute link found in a message body.</summary>
    public static string FirstLinkPath(string body)
    {
        var match = LinkRegex().Match(body);
        if (!match.Success) throw new InvalidOperationException("No link in email body.");
        return new Uri(WebUtility.HtmlDecode(match.Value)).PathAndQuery;
    }

    [GeneratedRegex("<form[^>]*method=\"post\"[^>]*>.*?</form>", RegexOptions.Singleline | RegexOptions.IgnoreCase)]
    private static partial Regex FormRegex();

    [GeneratedRegex("<input[^>]*type=\"hidden\"[^>]*>", RegexOptions.IgnoreCase)]
    private static partial Regex HiddenInputRegex();

    [GeneratedRegex(@"https?://[^\s""<>]+")]
    private static partial Regex LinkRegex();

    private static Regex AttrRegex(string attr) => new($"{attr}=\"([^\"]*)\"", RegexOptions.IgnoreCase);
}
