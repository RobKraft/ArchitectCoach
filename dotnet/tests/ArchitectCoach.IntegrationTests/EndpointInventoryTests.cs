using System.Net;
using ArchitectCoach.IntegrationTests.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;

namespace ArchitectCoach.IntegrationTests;

/// <summary>
/// Guards against security holes added in the future: every endpoint in the app either requires
/// sign-in or is on the explicit public list below. Adding a public page means adding it here,
/// deliberately, in a reviewed change (docs/plans/dotnet-blazor-rewrite.md §6).
/// </summary>
public class EndpointInventoryTests(AppFactory app) : IClassFixture<AppFactory>
{
    /// <summary>Every route that may be reached without signing in.</summary>
    private static readonly string[] PublicRoutes =
    [
        "",                                   // home / landing page
        "Error",
        "not-found",
        "Account/AccessDenied",
        "Account/ConfirmEmail",
        "Account/ConfirmEmailChange",
        "Account/ForgotPassword",
        "Account/ForgotPasswordConfirmation",
        "Account/InvalidPasswordReset",
        "Account/Lockout",
        "Account/Login",
        "Account/LoginWith2fa",
        "Account/LoginWithRecoveryCode",
        "Account/PasskeyRequestOptions",
        "Account/Register",
        "Account/RegisterConfirmation",
        "Account/ResendEmailConfirmation",
        "Account/ResetPassword",
        "Account/ResetPasswordConfirmation",
    ];

    private IReadOnlyList<RouteEndpoint> AppEndpoints() =>
        app.Services.GetServices<EndpointDataSource>()
            .SelectMany(s => s.Endpoints)
            .OfType<RouteEndpoint>()
            // Static assets (CSS/JS/images) are public by design; they're files, not pages or actions.
            .Where(e => !e.Metadata.Any(m => m.GetType().Name == "StaticAssetDescriptor"))
            .ToList();

    private static string Route(RouteEndpoint e) => (e.RoutePattern.RawText ?? "").Trim('/');

    [Fact]
    public async Task Fallback_policy_requires_an_authenticated_user()
    {
        var policy = await app.Services.GetRequiredService<IAuthorizationPolicyProvider>().GetFallbackPolicyAsync();
        Assert.NotNull(policy);
        Assert.Contains(policy!.Requirements, r => r is Microsoft.AspNetCore.Authorization.Infrastructure.DenyAnonymousAuthorizationRequirement);
    }

    [Fact]
    public void Only_listed_routes_allow_anonymous_access()
    {
        var anonymous = AppEndpoints()
            .Where(e => e.Metadata.GetMetadata<IAllowAnonymous>() is not null)
            .Select(Route)
            .Distinct()
            .OrderBy(r => r)
            .ToArray();

        var unexpected = anonymous.Except(PublicRoutes).ToArray();
        Assert.True(unexpected.Length == 0, $"Routes allow anonymous access but aren't on the public list: {string.Join(", ", unexpected)}");

        var missing = PublicRoutes.Except(anonymous).ToArray();
        Assert.True(missing.Length == 0, $"Public routes no longer found (update the list): {string.Join(", ", missing)}");
    }

    [Fact]
    public async Task Every_private_GET_route_redirects_signed_out_users_to_sign_in()
    {
        var client = app.NewClient();
        var privateGets = AppEndpoints()
            .Where(e => e.Metadata.GetMetadata<IAllowAnonymous>() is null)
            .Where(e => e.RoutePattern.Parameters.Count == 0)
            .Where(e => e.Metadata.GetMetadata<Microsoft.AspNetCore.Routing.HttpMethodMetadata>() is not { } m || m.HttpMethods.Contains("GET"))
            .Select(Route)
            .Distinct()
            .ToArray();

        Assert.NotEmpty(privateGets);
        foreach (var route in privateGets)
        {
            var response = await client.GetAsync("/" + route);
            Assert.True(response.StatusCode == HttpStatusCode.Redirect, $"/{route} returned {(int)response.StatusCode} to a signed-out user");
            Assert.Contains("/Account/Login", response.Headers.Location!.ToString());
        }
    }

    [Fact]
    public async Task Private_POST_endpoints_reject_signed_out_users()
    {
        var client = app.NewClient();
        foreach (var path in new[] { "/Account/Manage/DownloadPersonalData", "/Account/Logout", "/Account/PasskeyCreationOptions" })
        {
            var response = await client.PostAsync(path, new FormUrlEncodedContent([]));
            Assert.True(response.StatusCode is HttpStatusCode.Redirect or HttpStatusCode.Unauthorized or HttpStatusCode.BadRequest,
                $"POST {path} returned {(int)response.StatusCode} to a signed-out user");
            Assert.NotEqual(HttpStatusCode.OK, response.StatusCode);
        }
    }
}
