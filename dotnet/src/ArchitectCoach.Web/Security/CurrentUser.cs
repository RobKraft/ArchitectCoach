using System.Security.Claims;

namespace ArchitectCoach.Web.Security;

/// <summary>The signed-in user's id for the current request, or null when signed out.</summary>
public interface ICurrentUser
{
    string? UserId { get; }
}

public sealed class HttpContextCurrentUser(IHttpContextAccessor accessor) : ICurrentUser
{
    public string? UserId
    {
        get
        {
            var user = accessor.HttpContext?.User;
            return user?.Identity?.IsAuthenticated == true ? user.FindFirstValue(ClaimTypes.NameIdentifier) : null;
        }
    }
}
