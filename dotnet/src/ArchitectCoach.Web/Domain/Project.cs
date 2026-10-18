namespace ArchitectCoach.Web.Domain;

/// <summary>
/// One developer's project. Always owned by exactly one user: <see cref="OwnerId"/> is set by the
/// server from the signed-in user (never bound from form data), and AppDbContext's query filter
/// hides every project that isn't the current user's (docs/plans/dotnet-blazor-rewrite.md §6).
/// </summary>
public class Project
{
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>FK to AspNetUsers.Id. Deleting the user cascades to their projects.</summary>
    public string OwnerId { get; set; } = "";

    /// <summary>One of the wizard catalog's project types, e.g. "Static website".</summary>
    public string ProjectType { get; set; } = "";

    /// <summary>Optional one-line purpose typed by the developer.</summary>
    public string Purpose { get; set; } = "";

    /// <summary>Index of the next unanswered wizard step.</summary>
    public int StepIndex { get; set; }

    /// <summary>Structured knowledge accumulated by the wizard, stored as one JSON column (ADR-0001).</summary>
    public ProjectKnowledge Knowledge { get; set; } = new();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public List<DecisionRecord> Decisions { get; set; } = [];
}

public class ProjectKnowledge
{
    public RequirementsKnowledge Requirements { get; set; } = new();
    public ArchitectureKnowledge Architecture { get; set; } = new();
    public TechnologyKnowledge Technology { get; set; } = new();
}

public class RequirementsKnowledge
{
    public string Purpose { get; set; } = "";
    public List<string> Users { get; set; } = [];
    public List<string> Goals { get; set; } = [];
    public List<string> NonGoals { get; set; } = [];
    public List<string> FunctionalRequirements { get; set; } = [];
}

public class ArchitectureKnowledge
{
    public string Style { get; set; } = "";
    public List<string> Components { get; set; } = [];
    public string DataFlow { get; set; } = "";
    public string Notes { get; set; } = "";
}

public class TechnologyKnowledge
{
    public string Frontend { get; set; } = "";
    public string Backend { get; set; } = "";
    public string Database { get; set; } = "";
    public string Hosting { get; set; } = "";
    public string Authentication { get; set; } = "";
    public List<string> ThirdPartyServices { get; set; } = [];
}
