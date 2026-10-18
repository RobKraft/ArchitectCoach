using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;

namespace ArchitectCoach.Web.Security;

/// <summary>Bound from the "RateLimiting" configuration section.</summary>
public sealed class RateLimitSettings
{
    public const string Section = "RateLimiting";

    /// <summary>POSTs per minute per IP to account pages (sign-in, register, reset, resend, passkeys).</summary>
    public int AccountPostsPerMinute { get; set; } = 10;

    /// <summary>POSTs per minute per IP to everything else (wizard answers, project changes).</summary>
    public int OtherPostsPerMinute { get; set; } = 60;
}

/// <summary>
/// Limits form posts per client IP. GETs aren't limited here. Account pages get a tight budget
/// because they're the brute-force and email-flooding targets; Identity's lockout (5 failures)
/// protects individual accounts on top of this.
/// </summary>
public static class RateLimiting
{
    public static IServiceCollection AddAppRateLimiting(this IServiceCollection services, IConfiguration config)
    {
        services.Configure<RateLimitSettings>(config.GetSection(RateLimitSettings.Section));

        return services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
            {
                if (!HttpMethods.IsPost(context.Request.Method))
                    return RateLimitPartition.GetNoLimiter("get");

                var settings = context.RequestServices.GetRequiredService<IOptions<RateLimitSettings>>().Value;

                var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                var path = context.Request.Path;
                var isAccount = path.StartsWithSegments("/Account") && !path.StartsWithSegments("/Account/Manage");
                var limit = isAccount ? settings.AccountPostsPerMinute : settings.OtherPostsPerMinute;

                return RateLimitPartition.GetFixedWindowLimiter($"{(isAccount ? "account" : "other")}:{ip}", _ =>
                    new FixedWindowRateLimiterOptions { PermitLimit = limit, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 });
            });
        });
    }
}
