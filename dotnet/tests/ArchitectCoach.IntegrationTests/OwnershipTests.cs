using ArchitectCoach.IntegrationTests.Infrastructure;
using ArchitectCoach.Web.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using ArchitectCoach.Web.Data;

namespace ArchitectCoach.IntegrationTests;

/// <summary>
/// The database layer itself keeps users apart: these tests talk to ApplicationDbContext
/// directly, the same way any page or endpoint would, with no UI involved.
/// </summary>
public class OwnershipTests(AppFactory app) : IClassFixture<AppFactory>
{
    private const string Password = "correct-horse-battery";

    private async Task<(string alice, string bob, Guid aliceProject)> SeedAsync()
    {
        var suffix = Guid.NewGuid().ToString("N")[..8];
        var alice = await app.CreateConfirmedUserAsync($"alice-{suffix}@example.test", Password);
        var bob = await app.CreateConfirmedUserAsync($"bob-{suffix}@example.test", Password);

        await using var db = app.NewDbContext(alice);
        var project = new Project { ProjectType = "Static website", Purpose = "Alice's private project" };
        project.Decisions.Add(new DecisionRecord { Number = 1, Title = "Hosting", Section = DecisionSection.Technology, Decision = "Netlify" });
        db.Projects.Add(project);
        await db.SaveChangesAsync();
        return (alice, bob, project.Id);
    }

    [Fact]
    public async Task New_project_is_owned_by_the_current_user()
    {
        var (alice, _, id) = await SeedAsync();
        await using var db = app.NewDbContext(alice);
        Assert.Equal(alice, (await db.Projects.SingleAsync(p => p.Id == id)).OwnerId);
    }

    [Fact]
    public async Task Another_user_cannot_see_the_project_or_its_decisions()
    {
        var (_, bob, id) = await SeedAsync();
        await using var db = app.NewDbContext(bob);

        Assert.Null(await db.Projects.FindAsync(id));
        Assert.False(await db.Projects.AnyAsync(p => p.Id == id));
        Assert.False(await db.Decisions.AnyAsync(d => d.ProjectId == id));
    }

    [Fact]
    public async Task Signed_out_context_sees_nothing()
    {
        var (_, _, id) = await SeedAsync();
        await using var db = app.NewDbContext(userId: null);
        Assert.False(await db.Projects.AnyAsync(p => p.Id == id));
        Assert.Equal(0, await db.Decisions.CountAsync());
    }

    [Fact]
    public async Task Cannot_create_a_project_for_another_user()
    {
        var (alice, bob, _) = await SeedAsync();
        await using var db = app.NewDbContext(bob);
        db.Projects.Add(new Project { ProjectType = "Phone app", OwnerId = alice });
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => db.SaveChangesAsync());
    }

    [Fact]
    public async Task Cannot_create_a_project_while_signed_out()
    {
        await using var db = app.NewDbContext(userId: null);
        db.Projects.Add(new Project { ProjectType = "Phone app" });
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => db.SaveChangesAsync());
    }

    [Fact]
    public async Task Cannot_take_over_a_project_by_changing_its_owner()
    {
        var (alice, bob, id) = await SeedAsync();
        await using var db = app.NewDbContext(alice);
        var project = await db.Projects.SingleAsync(p => p.Id == id);
        project.OwnerId = bob;
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => db.SaveChangesAsync());
    }

    [Fact]
    public async Task Deleting_a_user_deletes_their_projects_and_decisions()
    {
        var (alice, _, id) = await SeedAsync();
        using (var scope = app.Services.CreateScope())
        {
            var users = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var result = await users.DeleteAsync((await users.FindByIdAsync(alice))!);
            Assert.True(result.Succeeded);
        }

        // Check with filters off: nothing may survive, for anyone.
        await using var db = app.NewDbContext(alice);
        Assert.False(await db.Projects.IgnoreQueryFilters().AnyAsync(p => p.Id == id));
        Assert.False(await db.Decisions.IgnoreQueryFilters().AnyAsync(d => d.ProjectId == id));
    }
}
