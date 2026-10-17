import type { DecisionRecord } from "@prisma/client";
import type { ProjectKnowledge } from "@/lib/knowledge/types";
import type { WizardStep } from "@/lib/wizard/catalog";

/**
 * Builds a plain-text prompt a developer can paste into any AI chat tool to get a second
 * opinion on the current wizard question, with enough context (project purpose, decisions
 * so far, the question, and every option's tradeoffs) for that AI to give a grounded answer.
 */
export function buildDiscussPrompt(
  projectName: string,
  knowledge: ProjectKnowledge,
  decisions: DecisionRecord[],
  step: WizardStep
): string {
  const lines: string[] = [];

  lines.push(
    `I'm a junior developer planning a project called "${projectName}" using a tool called ArchitectCoach. I'd like a second opinion on one decision before I pick an option.`
  );

  if (knowledge.requirements.purpose) {
    lines.push("", `Project purpose: ${knowledge.requirements.purpose}`);
  }

  if (decisions.length) {
    lines.push("", "Decisions I've already made:");
    for (const d of decisions) {
      lines.push(`- ${d.title}: ${d.decision}`);
    }
  }

  lines.push("", `Current question: ${step.question}`, "", step.whyItMatters, "", "The options I'm choosing between:");
  for (const opt of step.options) {
    lines.push(
      "",
      `- ${opt.label}${opt.recommended ? " (ArchitectCoach's suggested default)" : ""}`,
      `  ${opt.summary}`,
      `  Tradeoffs: ${opt.tradeoffs}`
    );
  }

  lines.push(
    "",
    "Given everything above, which option would you recommend for this specific project, and why? Please explain it simply, like you would to a junior developer, and call out anything from my earlier decisions above that might make one option a better or worse fit."
  );

  return lines.join("\n");
}
