using System.Text;
using ArchitectCoach.Web.Content;
using ArchitectCoach.Web.Domain;

namespace ArchitectCoach.Web.Services;

/// <summary>
/// Plain-text prompt a developer can paste into their own AI chat tool for a second opinion on
/// the current wizard question (port of the Next.js discussPrompt.ts). Nothing is sent anywhere
/// by this site: the developer copies it themselves.
/// </summary>
public static class DiscussPrompt
{
    public static string Build(Project project, IEnumerable<DecisionRecord> decisions, WizardStep step)
    {
        var sb = new StringBuilder();
        sb.AppendLine($"I'm a junior developer planning a project (a {project.ProjectType.ToLowerInvariant()}) using a tool called ArchitectCoach. I'd like a second opinion on one decision before I pick an option.");

        if (!string.IsNullOrWhiteSpace(project.Knowledge.Requirements.Purpose))
            sb.AppendLine().AppendLine($"Project purpose: {project.Knowledge.Requirements.Purpose}");

        var made = decisions.OrderBy(d => d.Number).ToList();
        if (made.Count > 0)
        {
            sb.AppendLine().AppendLine("Decisions I've already made:");
            foreach (var d in made) sb.AppendLine($"- {d.Title}: {d.Decision}");
        }

        sb.AppendLine().AppendLine($"Current question: {step.Question}").AppendLine().AppendLine(step.WhyItMatters)
          .AppendLine().AppendLine("The options I'm choosing between:");
        foreach (var o in step.Options)
        {
            sb.AppendLine()
              .AppendLine($"- {o.Label}{(o.Recommended ? " (ArchitectCoach's suggested default)" : "")}")
              .AppendLine($"  {o.Summary}")
              .AppendLine($"  Tradeoffs: {o.Tradeoffs}");
        }

        sb.AppendLine().Append("Given everything above, which option would you recommend for this specific project, and why? Please explain it simply, like you would to a junior developer, and call out anything from my earlier decisions above that might make one option a better or worse fit.");
        return sb.ToString();
    }
}
