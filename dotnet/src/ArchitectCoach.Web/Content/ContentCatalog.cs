using System.Text.Json;

namespace ArchitectCoach.Web.Content;

/// <summary>
/// The static, hand-written content (wizard steps, option assessments, open questions,
/// privacy/accessibility guidance), loaded once from the JSON files embedded in this assembly.
/// No AI and no database are involved in answering any of it (ADR-0007).
/// </summary>
public sealed class ContentCatalog
{
    public WizardContent Wizard { get; }
    public AssessmentContent Assessments { get; }
    public OpenQuestionContent OpenQuestions { get; }
    public PrivacyAccessibilityContent PrivacyAccessibility { get; }

    public ContentCatalog()
    {
        Wizard = Load<WizardContent>("wizard.json");
        Assessments = Load<AssessmentContent>("assessments.json");
        OpenQuestions = Load<OpenQuestionContent>("open-questions.json");
        PrivacyAccessibility = Load<PrivacyAccessibilityContent>("privacy-accessibility.json");
    }

    public IReadOnlyList<string> ProjectTypes => Wizard.ProjectTypes.Select(t => t.Label).ToList();

    public bool IsProjectType(string type) => Wizard.Steps.ContainsKey(type);

    /// <summary>The ordered steps for a project type, or empty for an unknown type.</summary>
    public IReadOnlyList<WizardStep> StepsFor(string projectType) =>
        Wizard.Steps.TryGetValue(projectType, out var steps) ? steps : [];

    /// <summary>optionId → assessment for one step, or null for steps without assessments.</summary>
    public IReadOnlyDictionary<string, OptionAssessment>? AssessmentsFor(string stepId) =>
        Assessments.ByStep.TryGetValue(stepId, out var byOption) ? byOption : null;

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private static T Load<T>(string fileName)
    {
        var assembly = typeof(ContentCatalog).Assembly;
        var resource = assembly.GetManifestResourceNames().SingleOrDefault(n => n.EndsWith($".Content.{fileName}", StringComparison.Ordinal))
            ?? throw new InvalidOperationException($"Embedded content file '{fileName}' not found.");
        using var stream = assembly.GetManifestResourceStream(resource)!;
        return JsonSerializer.Deserialize<T>(stream, JsonOptions)
            ?? throw new InvalidOperationException($"Content file '{fileName}' is empty.");
    }
}
