using ArchitectCoach.Web.Domain;
using ArchitectCoach.Web.Security;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ArchitectCoach.Web.Data;

/// <summary>
/// Identity tables plus the app's own. Owner scoping is enforced here, not in pages: every query
/// on <see cref="Projects"/> and <see cref="Decisions"/> is filtered to the current user, and
/// SaveChanges refuses to write a project for anyone else. A page that forgets a Where clause
/// still can't see or change another user's data (docs/plans/dotnet-blazor-rewrite.md §6).
/// </summary>
public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, ICurrentUser currentUser)
    : IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<DecisionRecord> Decisions => Set<DecisionRecord>();

    /// <summary>Read per query by the filters below; null (signed out) matches no rows.</summary>
    private string? CurrentUserId => currentUser.UserId;

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ApplicationUser>().Property(u => u.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

        builder.Entity<Project>(p =>
        {
            p.HasKey(x => x.Id);
            p.Property(x => x.OwnerId).IsRequired().HasMaxLength(450);
            p.Property(x => x.ProjectType).IsRequired().HasMaxLength(100);
            p.Property(x => x.Purpose).HasMaxLength(500);
            // Two tabs answering the same step: the second save fails instead of double-applying.
            p.Property(x => x.StepIndex).IsConcurrencyToken();
            p.HasIndex(x => x.OwnerId);
            p.HasOne<ApplicationUser>().WithMany().HasForeignKey(x => x.OwnerId).OnDelete(DeleteBehavior.Cascade);
            p.OwnsOne(x => x.Knowledge, k =>
            {
                k.ToJson();
                k.OwnsOne(x => x.Requirements);
                k.OwnsOne(x => x.Architecture);
                k.OwnsOne(x => x.Technology);
            });
            p.HasQueryFilter(x => x.OwnerId == CurrentUserId);
        });

        builder.Entity<DecisionRecord>(d =>
        {
            d.HasKey(x => x.Id);
            d.HasOne(x => x.Project).WithMany(x => x.Decisions).HasForeignKey(x => x.ProjectId).OnDelete(DeleteBehavior.Cascade);
            d.HasIndex(x => new { x.ProjectId, x.Number }).IsUnique();
            d.Property(x => x.Title).HasMaxLength(200);
            d.Property(x => x.Section).HasConversion<string>().HasMaxLength(20);
            d.HasQueryFilter(x => x.Project.OwnerId == CurrentUserId);
        });
    }

    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        EnforceOwnership();
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
    {
        EnforceOwnership();
        return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }

    /// <summary>
    /// New projects are stamped with the current user; an explicit other owner, or changing the
    /// owner of an existing project, is refused. Deleting a user cascades in the database, so it
    /// doesn't pass through here.
    /// </summary>
    private void EnforceOwnership()
    {
        foreach (var entry in ChangeTracker.Entries<Project>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    var userId = CurrentUserId ?? throw new UnauthorizedAccessException("Projects can only be created by a signed-in user.");
                    if (entry.Entity.OwnerId.Length > 0 && entry.Entity.OwnerId != userId)
                        throw new UnauthorizedAccessException("A project can't be created for another user.");
                    entry.Entity.OwnerId = userId;
                    break;
                case EntityState.Modified:
                    if (entry.Property(x => x.OwnerId).IsModified)
                        throw new UnauthorizedAccessException("A project's owner can't be changed.");
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    break;
            }
        }
    }
}
