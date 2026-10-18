using ArchitectCoach.Web.Content;
using ArchitectCoach.Web.Data;
using ArchitectCoach.Web.Domain;
using Microsoft.EntityFrameworkCore;

namespace ArchitectCoach.Web.Services;

public enum AnswerResult { Applied, Finished, ProjectNotFound, NotCurrentStep, UnknownOption }

/// <summary>
/// Creates projects and applies wizard answers (port of the Next.js applyAnswer.ts and the
/// knowledge merge in interviewTools.ts). All reads go through ApplicationDbContext, so another
/// user's project is simply "not found" here (ADR-0010).
/// </summary>
public sealed class WizardService(ApplicationDbContext db, ContentCatalog content)
{
    public const int MaxPurposeLength = 500;

    /// <summary>Returns the new project's id, or null if the type isn't a wizard project type.</summary>
    public async Task<Guid?> CreateProjectAsync(string projectType, string? purpose, CancellationToken ct = default)
    {
        if (!content.IsProjectType(projectType)) return null;
        var trimmed = (purpose ?? "").Trim();
        if (trimmed.Length > MaxPurposeLength) trimmed = trimmed[..MaxPurposeLength];

        var project = new Project { ProjectType = projectType, Purpose = trimmed };
        project.Knowledge.Requirements.Purpose = trimmed;
        db.Projects.Add(project);
        await db.SaveChangesAsync(ct);
        return project.Id;
    }

    public async Task<AnswerResult> ApplyAnswerAsync(Guid projectId, string stepId, string optionId, CancellationToken ct = default)
    {
        var project = await db.Projects.Include(p => p.Decisions).SingleOrDefaultAsync(p => p.Id == projectId, ct);
        if (project is null) return AnswerResult.ProjectNotFound;

        var steps = content.StepsFor(project.ProjectType);
        var stepIndex = steps.ToList().FindIndex(s => s.Id == stepId);
        if (stepIndex < 0 || stepIndex != project.StepIndex) return AnswerResult.NotCurrentStep;

        var step = steps[stepIndex];
        var option = step.Options.SingleOrDefault(o => o.Id == optionId);
        if (option is null) return AnswerResult.UnknownOption;

        ApplyToKnowledge(project.Knowledge, step, option.Label);

        if (step.RecordDecision is { } spec)
        {
            // Added through the DbSet so EF inserts it: DecisionRecord sets its own Guid key, and a
            // keyed entity attached via a navigation would be treated as existing (an UPDATE).
            var record = BuildDecision(step, spec, option, project.Decisions.Count == 0 ? 1 : project.Decisions.Max(d => d.Number) + 1);
            record.ProjectId = project.Id;
            db.Decisions.Add(record);
        }

        project.StepIndex = stepIndex + 1;
        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateConcurrencyException)
        {
            // Another tab answered this step first (StepIndex is a concurrency token).
            return AnswerResult.NotCurrentStep;
        }
        return project.StepIndex >= steps.Count ? AnswerResult.Finished : AnswerResult.Applied;
    }

    /// <summary>The Decision Record for a pick (same fields and wording as the Next.js applyAnswer.ts).</summary>
    public static DecisionRecord BuildDecision(WizardStep step, RecordDecisionSpec spec, WizardOption option, int number) => new()
    {
        Number = number,
        Title = spec.Title,
        Section = Enum.Parse<DecisionSection>(step.Topic, ignoreCase: true),
        Decision = $"{option.Label} (for: \"{step.Question}\")",
        Rationale = option.Summary,
        Alternatives = string.Join(" ", step.Options.Where(o => o.Id != option.Id).Select(o => $"{o.Label} — {o.Summary}")),
        Tradeoffs = option.Tradeoffs,
        Consequences = spec.Consequences ?? "",
    };

    /// <summary>
    /// Writes the picked label into knowledge[topic][field]: strings are replaced, lists get the
    /// label added once (the Next.js app unioned arrays the same way).
    /// </summary>
    public static void ApplyToKnowledge(ProjectKnowledge k, WizardStep step, string label)
    {
        switch ((step.Topic, step.Field))
        {
            case ("requirements", "purpose"): k.Requirements.Purpose = label; break;
            case ("requirements", "users"): AddOnce(k.Requirements.Users, label); break;
            case ("requirements", "goals"): AddOnce(k.Requirements.Goals, label); break;
            case ("requirements", "nonGoals"): AddOnce(k.Requirements.NonGoals, label); break;
            case ("requirements", "functionalRequirements"): AddOnce(k.Requirements.FunctionalRequirements, label); break;
            case ("architecture", "style"): k.Architecture.Style = label; break;
            case ("architecture", "components"): AddOnce(k.Architecture.Components, label); break;
            case ("architecture", "dataFlow"): k.Architecture.DataFlow = label; break;
            case ("architecture", "notes"): k.Architecture.Notes = label; break;
            case ("technology", "frontend"): k.Technology.Frontend = label; break;
            case ("technology", "backend"): k.Technology.Backend = label; break;
            case ("technology", "database"): k.Technology.Database = label; break;
            case ("technology", "hosting"): k.Technology.Hosting = label; break;
            case ("technology", "authentication"): k.Technology.Authentication = label; break;
            case ("technology", "thirdPartyServices"): AddOnce(k.Technology.ThirdPartyServices, label); break;
            default: throw new InvalidOperationException($"Wizard step {step.Id} targets unknown field {step.Topic}.{step.Field}.");
        }

        static void AddOnce(List<string> list, string value)
        {
            if (!list.Contains(value)) list.Add(value);
        }
    }

    /// <summary>
    /// Which option was picked at each answered step, recovered from the knowledge the same way
    /// the Next.js resolveChoices.ts does (the picked label is stored in the step's field).
    /// </summary>
    public IReadOnlyList<(WizardStep Step, WizardOption Option)> ResolveChoices(Project project)
    {
        var result = new List<(WizardStep, WizardOption)>();
        foreach (var step in content.StepsFor(project.ProjectType))
        {
            foreach (var option in step.Options)
            {
                if (StoredValueMatches(project.Knowledge, step, option.Label))
                {
                    result.Add((step, option));
                    break;
                }
            }
        }
        return result;
    }

    private static bool StoredValueMatches(ProjectKnowledge k, WizardStep step, string label) => (step.Topic, step.Field) switch
    {
        ("requirements", "purpose") => k.Requirements.Purpose == label,
        ("requirements", "users") => k.Requirements.Users.Contains(label),
        ("requirements", "goals") => k.Requirements.Goals.Contains(label),
        ("requirements", "nonGoals") => k.Requirements.NonGoals.Contains(label),
        ("requirements", "functionalRequirements") => k.Requirements.FunctionalRequirements.Contains(label),
        ("architecture", "style") => k.Architecture.Style == label,
        ("architecture", "components") => k.Architecture.Components.Contains(label),
        ("architecture", "dataFlow") => k.Architecture.DataFlow == label,
        ("architecture", "notes") => k.Architecture.Notes == label,
        ("technology", "frontend") => k.Technology.Frontend == label,
        ("technology", "backend") => k.Technology.Backend == label,
        ("technology", "database") => k.Technology.Database == label,
        ("technology", "hosting") => k.Technology.Hosting == label,
        ("technology", "authentication") => k.Technology.Authentication == label,
        ("technology", "thirdPartyServices") => k.Technology.ThirdPartyServices.Contains(label),
        _ => false,
    };
}
