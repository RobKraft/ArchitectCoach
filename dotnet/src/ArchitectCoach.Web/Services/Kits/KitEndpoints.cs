using ArchitectCoach.Web.Data;
using Microsoft.EntityFrameworkCore;

namespace ArchitectCoach.Web.Services.Kits;

public static class KitEndpoints
{
    /// <summary>
    /// GET /projects/{id}/kit: the Spec Kit ZIP. Requires sign-in (fallback policy), and the
    /// lookup goes through the owner-filtered context, so another user's project is a 404.
    /// </summary>
    public static IEndpointRouteBuilder MapKitEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/projects/{id:guid}/kit", async (Guid id, ApplicationDbContext db, KitService kits, HttpContext http) =>
        {
            var project = await db.Projects.AsNoTracking().Include(p => p.Decisions).SingleOrDefaultAsync(p => p.Id == id);
            if (project is null) return Results.NotFound();

            // The kit contains the user's own project details; don't let shared caches keep it.
            http.Response.Headers.CacheControl = "no-store";
            return Results.File(kits.BuildZip(project), "application/zip", KitService.ZipFileName(project));
        });
        return endpoints;
    }
}
