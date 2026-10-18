namespace ArchitectCoach.Web.Content;

// Typed shapes of the JSON files in this folder (exported from the Next.js app by
// scripts/export-content.ts). Property names match the JSON in camelCase.

public sealed record ProjectTypeOption(string Label, string Message);

public sealed record WizardContent(
    IReadOnlyList<ProjectTypeOption> ProjectTypes,
    IReadOnlyDictionary<string, IReadOnlyList<WizardStep>> Steps);

public sealed record WizardStep(
    string Id,
    string Topic,
    string Field,
    string Question,
    string WhyItMatters,
    IReadOnlyList<WizardOption> Options,
    bool Multi = false,
    RecordDecisionSpec? RecordDecision = null);

public sealed record RecordDecisionSpec(string Title, string? Consequences = null);

public sealed record WizardOption(string Id, string Label, string Summary, string Tradeoffs, bool Recommended = false);

public sealed record AssessmentContent(
    string AsOf,
    IReadOnlyList<string> CostBuckets,
    IReadOnlyList<AssessmentDimension> Dimensions,
    IReadOnlyDictionary<string, IReadOnlyDictionary<string, OptionAssessment>> ByStep);

public sealed record AssessmentDimension(string Key, string Label);

public sealed record OptionAssessment(
    LevelNote Deployment,
    ComponentsNote Components,
    CostNote Cost,
    string Security,
    ScalabilityNote Scalability,
    string Grc,
    string Auditing,
    string CostMonitoring,
    string Performance);

public sealed record LevelNote(string Complexity, string Notes);
public sealed record ComponentsNote(IReadOnlyList<string> Accounts, string Notes);
public sealed record CostNote(string Bucket, string Notes);
public sealed record ScalabilityNote(string Level, string Notes);

public sealed record OpenQuestionContent(
    IReadOnlyList<OpenQuestion> Universal,
    IReadOnlyDictionary<string, IReadOnlyList<OpenQuestion>> ByProjectType,
    IReadOnlyDictionary<string, IReadOnlyList<OpenQuestion>> ByOption);

public sealed record OpenQuestion(string Question, string WhyItMatters, string Phase);

public sealed record PrivacyAccessibilityContent(
    string AsOf,
    IReadOnlyDictionary<string, string> PlatformByProjectType,
    IReadOnlyDictionary<string, string> MarkdownByProjectType);
