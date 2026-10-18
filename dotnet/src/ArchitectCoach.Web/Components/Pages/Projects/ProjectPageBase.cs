using ArchitectCoach.Web.Content;
using ArchitectCoach.Web.Data;
using ArchitectCoach.Web.Domain;
using Microsoft.AspNetCore.Components;
using Microsoft.EntityFrameworkCore;

namespace ArchitectCoach.Web.Components.Pages.Projects;

/// <summary>
/// Shared loading for /projects/{id}/... pages. The lookup goes through ApplicationDbContext,
/// whose owner filter makes another user's project indistinguishable from a missing one: both
/// render the 404 page (ADR-0010).
/// </summary>
public abstract class ProjectPageBase : ComponentBase
{
    [Parameter] public Guid Id { get; set; }

    [Inject] protected ApplicationDbContext Db { get; set; } = default!;
    [Inject] protected ContentCatalog Content { get; set; } = default!;
    [Inject] protected NavigationManager Nav { get; set; } = default!;

    protected Project? Project { get; private set; }

    protected IReadOnlyList<WizardStep> Steps => Project is null ? [] : Content.StepsFor(Project.ProjectType);

    protected override async Task OnInitializedAsync()
    {
        Project = await Db.Projects.AsNoTracking()
            .Include(p => p.Decisions.OrderBy(d => d.Number))
            .SingleOrDefaultAsync(p => p.Id == Id);
        if (Project is null)
        {
            Nav.NotFound();
            return;
        }
        await OnProjectLoadedAsync();
    }

    protected virtual Task OnProjectLoadedAsync() => Task.CompletedTask;

    protected string ProjectUrl(string? sub = null) => sub is null ? $"projects/{Id}" : $"projects/{Id}/{sub}";
}
