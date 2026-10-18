namespace ArchitectCoach.Web.Domain;

public enum DecisionSection { Requirements, Architecture, Technology, Other }

/// <summary>
/// A significant choice recorded during the wizard. Only reachable through its project, so it
/// inherits the project's owner scoping.
/// </summary>
public class DecisionRecord
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    /// <summary>Sequential per project, starting at 1.</summary>
    public int Number { get; set; }

    public string Title { get; set; } = "";
    public DecisionSection Section { get; set; }
    public string Decision { get; set; } = "";
    public string Rationale { get; set; } = "";
    public string Alternatives { get; set; } = "";
    public string Tradeoffs { get; set; } = "";
    public string Consequences { get; set; } = "";
    public List<string> LearnMore { get; set; } = [];
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
