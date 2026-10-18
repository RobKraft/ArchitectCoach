using ArchitectCoach.Web.Content;
using ArchitectCoach.Web.Domain;
using ArchitectCoach.Web.Services;

namespace ArchitectCoach.Tests;

public class WizardLogicTests
{
    private static readonly ContentCatalog Content = new();

    // ResolveChoices only reads content, never the database.
    private static readonly WizardService Wizard = new(db: null!, Content);

    private static Project Answered(string type, int pick)
    {
        var project = new Project { ProjectType = type };
        foreach (var step in Content.StepsFor(type))
            WizardService.ApplyToKnowledge(project.Knowledge, step, step.Options[Math.Min(pick, step.Options.Count - 1)].Label);
        return project;
    }

    [Fact]
    public void Every_step_writes_to_a_known_field()
    {
        foreach (var type in Content.ProjectTypes)
            foreach (var step in Content.StepsFor(type))
                WizardService.ApplyToKnowledge(new ProjectKnowledge(), step, step.Options[0].Label); // throws on unknown field
    }

    [Fact]
    public void List_fields_add_each_label_once_and_strings_are_replaced()
    {
        var k = new ProjectKnowledge();
        var audience = Content.StepsFor("Static website").First(s => s.Field == "users");
        WizardService.ApplyToKnowledge(k, audience, "A");
        WizardService.ApplyToKnowledge(k, audience, "A");
        WizardService.ApplyToKnowledge(k, audience, "B");
        Assert.Equal(["A", "B"], k.Requirements.Users);

        var hosting = Content.StepsFor("Static website").First(s => s.Field == "hosting");
        WizardService.ApplyToKnowledge(k, hosting, "X");
        WizardService.ApplyToKnowledge(k, hosting, "Y");
        Assert.Equal("Y", k.Technology.Hosting);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(3)]
    public void Picked_options_can_be_recovered_from_knowledge(int pick)
    {
        foreach (var type in Content.ProjectTypes)
        {
            var steps = Content.StepsFor(type);
            var choices = Wizard.ResolveChoices(Answered(type, pick));
            Assert.Equal(steps.Count, choices.Count);
            foreach (var (step, option) in choices)
                Assert.Equal(step.Options[Math.Min(pick, step.Options.Count - 1)].Id, option.Id);
        }
    }

    [Fact]
    public void Discuss_prompt_includes_context_and_every_option()
    {
        var project = new Project { ProjectType = "Phone app" };
        project.Knowledge.Requirements.Purpose = "Track dog walks";
        var step = Content.StepsFor("Phone app").First(s => s.Topic == "architecture");
        var prompt = DiscussPrompt.Build(project, [new DecisionRecord { Number = 1, Title = "Audience", Decision = "Consumers" }], step);

        Assert.Contains("Track dog walks", prompt);
        Assert.Contains("- Audience: Consumers", prompt);
        Assert.Contains(step.Question, prompt);
        Assert.All(step.Options, o => Assert.Contains(o.Label, prompt));
    }
}
