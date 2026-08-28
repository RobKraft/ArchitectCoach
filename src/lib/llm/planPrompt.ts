import type { DecisionRecord } from "@prisma/client";
import type { ProjectKnowledge } from "@/lib/knowledge/types";
import { summarizeKnowledge } from "./context";

/**
 * One-shot (no tools) prompt for generating the development plan page: milestones,
 * features, tasks, dependencies, recommended order — built from the full structured
 * knowledge model plus the decisions on record, not the raw interview transcript.
 */
export function buildPlanPrompt(
  projectName: string,
  knowledge: ProjectKnowledge,
  decisions: DecisionRecord[]
): string {
  const knowledgeSummary = summarizeKnowledge(knowledge, {
    currentTopic: "",
    completedTopics: [],
    stepIndex: 0,
  });

  const decisionsSummary = decisions.length
    ? decisions
        .map((d) => `- Decision #${d.number} (${d.section}): ${d.title} — ${d.decision}`)
        .join("\n")
    : "(no decisions recorded yet)";

  return `Project: ${projectName}

${knowledgeSummary}

Decision records:
${decisionsSummary}

Based on the above, write a development plan as markdown with these sections:
## Milestones
## Features & Tasks (grouped by milestone, note dependencies between tasks)
## Recommended Implementation Order
## Open Questions (anything the plan depends on that isn't decided yet)

Be concrete and specific to this project — do not write generic advice that could
apply to any software project. If requirements or technology choices are missing,
say so in "Open Questions" rather than inventing them.`;
}
