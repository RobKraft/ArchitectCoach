using ArchitectCoach.Web.Content;

namespace ArchitectCoach.Tests;

/// <summary>
/// Ports the completeness checks from the Next.js app (wizardCatalog/optionAssessments/specKit
/// tests): the content can't silently drift into a state the wizard or kit can't handle.
/// </summary>
public class ContentCatalogTests
{
    private static readonly ContentCatalog Content = new();
    private static readonly string[] Topics = ["requirements", "architecture", "technology"];
    private static readonly string[] Levels = ["Low", "Medium", "High"];

    private static IEnumerable<(string Type, WizardStep Step)> AllSteps() =>
        Content.Wizard.Steps.SelectMany(kv => kv.Value.Select(s => (kv.Key, s)));

    private static IEnumerable<(string Type, WizardStep Step)> AssessedSteps() =>
        AllSteps().Where(x => x.Step.Topic != "requirements");

    [Fact]
    public void Every_project_type_has_steps_and_vice_versa()
    {
        Assert.Equal(5, Content.ProjectTypes.Count);
        Assert.Equal(Content.ProjectTypes.OrderBy(t => t), Content.Wizard.Steps.Keys.OrderBy(t => t));
        Assert.All(Content.ProjectTypes, t => Assert.NotEmpty(Content.StepsFor(t)));
    }

    [Fact]
    public void Steps_are_well_formed()
    {
        foreach (var (type, steps) in Content.Wizard.Steps)
        {
            Assert.True(steps.Select(s => s.Id).Distinct().Count() == steps.Count, $"{type} has duplicate step ids");
            foreach (var step in steps)
            {
                Assert.Contains(step.Topic, Topics);
                Assert.False(string.IsNullOrWhiteSpace(step.Question), $"{step.Id} has no question");
                Assert.False(string.IsNullOrWhiteSpace(step.WhyItMatters), $"{step.Id} has no why-it-matters");
                Assert.True(step.Options.Count >= 2, $"{step.Id} needs 2+ options");
                Assert.True(step.Options.Select(o => o.Id).Distinct().Count() == step.Options.Count, $"{step.Id} has duplicate option ids");
                Assert.True(step.Options.Count(o => o.Recommended) <= 1, $"{step.Id} has more than one recommended option");
                Assert.All(step.Options, o => Assert.False(string.IsNullOrWhiteSpace(o.Tradeoffs), $"{step.Id}/{o.Id} has no tradeoffs"));
            }
        }
    }

    [Fact]
    public void Step_ids_are_unique_across_all_types()
    {
        var ids = AllSteps().Select(x => x.Step.Id).ToList();
        Assert.Equal(ids.Count, ids.Distinct().Count());
    }

    [Fact]
    public void Every_architecture_and_technology_option_has_a_complete_assessment()
    {
        Assert.Equal(60, AssessedSteps().Sum(x => x.Step.Options.Count));
        foreach (var (type, step) in AssessedSteps())
        {
            var byOption = Content.AssessmentsFor(step.Id);
            Assert.True(byOption is not null, $"{type}/{step.Id} has no assessments");
            foreach (var option in step.Options)
            {
                Assert.True(byOption!.TryGetValue(option.Id, out var a), $"{type}/{step.Id}/{option.Label} has no assessment");
                var where = $"{step.Id}/{option.Id}";
                Assert.Contains(a!.Cost.Bucket, Content.Assessments.CostBuckets);
                Assert.Contains(a.Deployment.Complexity, Levels);
                Assert.Contains(a.Scalability.Level, Levels);
                foreach (var text in new[] { a.Deployment.Notes, a.Components.Notes, a.Cost.Notes, a.Security, a.Scalability.Notes, a.Grc, a.Auditing, a.CostMonitoring, a.Performance })
                    Assert.False(string.IsNullOrWhiteSpace(text), $"{where} has an empty dimension");
            }
        }
    }

    [Fact]
    public void Requirements_steps_have_no_assessments_and_no_orphans_exist()
    {
        Assert.Null(Content.AssessmentsFor("static-website-audience"));
        var known = AssessedSteps().ToDictionary(x => x.Step.Id, x => x.Step.Options.Select(o => o.Id).ToHashSet());
        foreach (var (stepId, byOption) in Content.Assessments.ByStep)
        {
            Assert.True(known.ContainsKey(stepId), $"assessment for unknown step {stepId}");
            Assert.All(byOption.Keys, optionId => Assert.Contains(optionId, known[stepId]));
        }
    }

    [Fact]
    public void Open_questions_reference_real_types_and_options()
    {
        Assert.Equal(Content.ProjectTypes.OrderBy(t => t), Content.OpenQuestions.ByProjectType.Keys.OrderBy(t => t));
        var valid = AllSteps().SelectMany(x => x.Step.Options.Select(o => $"{x.Step.Id}/{o.Id}")).ToHashSet();
        Assert.All(Content.OpenQuestions.ByOption.Keys, key => Assert.Contains(key, valid));
        Assert.All(Content.OpenQuestions.Universal.Concat(Content.OpenQuestions.ByProjectType.Values.SelectMany(q => q)),
            q => Assert.Contains(q.Phase, new[] { "spec", "plan" }));
    }

    [Fact]
    public void Privacy_and_accessibility_guidance_exists_for_every_type()
    {
        foreach (var type in Content.ProjectTypes)
        {
            var md = Content.PrivacyAccessibility.MarkdownByProjectType[type];
            Assert.Contains("GDPR checklist", md);
            Assert.Contains("CCPA checklist", md);
            Assert.Contains("WCAG 2.2 AA", md);
        }
    }
}
