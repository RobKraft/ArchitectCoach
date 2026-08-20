import type { CoreMessage } from "ai";
import { prisma } from "@/lib/db";
import { parseInterviewState, parseProjectKnowledge, type InterviewState, type ProjectKnowledge } from "@/lib/knowledge/types";

/**
 * How much raw chat history gets replayed to the model each turn. Cost control per
 * the source conversation: the model reasons from the compact structured knowledge
 * summary below, not the full transcript, so this can stay small without losing
 * context — recent back-and-forth is still useful for conversational continuity.
 */
export const MAX_HISTORY_MESSAGES = 10;

/**
 * Renders the structured knowledge model as compact text the model can read as
 * "current project state" instead of being sent the whole conversation so far.
 */
export function summarizeKnowledge(
  knowledge: ProjectKnowledge,
  interviewState: InterviewState
): string {
  const lines: string[] = [];

  lines.push(`Current interview topic: ${interviewState.currentTopic}`);
  lines.push(
    `Completed topics: ${interviewState.completedTopics.length ? interviewState.completedTopics.join(", ") : "(none yet)"}`
  );

  lines.push("", "Requirements:");
  lines.push(`- Purpose: ${knowledge.requirements.purpose || "(not yet defined)"}`);
  lines.push(`- Users: ${listOrPlaceholder(knowledge.requirements.users)}`);
  lines.push(`- Goals: ${listOrPlaceholder(knowledge.requirements.goals)}`);
  lines.push(`- Non-goals: ${listOrPlaceholder(knowledge.requirements.nonGoals)}`);
  lines.push(
    `- Functional requirements: ${listOrPlaceholder(knowledge.requirements.functionalRequirements)}`
  );

  lines.push("", "Architecture:");
  lines.push(`- Style: ${knowledge.architecture.style || "(not yet defined)"}`);
  lines.push(`- Components: ${listOrPlaceholder(knowledge.architecture.components)}`);
  lines.push(`- Data flow: ${knowledge.architecture.dataFlow || "(not yet defined)"}`);

  lines.push("", "Technology:");
  lines.push(`- Frontend: ${knowledge.technology.frontend || "(not yet defined)"}`);
  lines.push(`- Backend: ${knowledge.technology.backend || "(not yet defined)"}`);
  lines.push(`- Database: ${knowledge.technology.database || "(not yet defined)"}`);
  lines.push(`- Hosting: ${knowledge.technology.hosting || "(not yet defined)"}`);
  lines.push(`- Authentication: ${knowledge.technology.authentication || "(not yet defined)"}`);
  lines.push(
    `- Third-party services: ${listOrPlaceholder(knowledge.technology.thirdPartyServices)}`
  );

  return lines.join("\n");
}

function listOrPlaceholder(items: string[]): string {
  return items.length ? items.join("; ") : "(none yet)";
}

/**
 * Fetches only the last MAX_HISTORY_MESSAGES messages for this project, oldest
 * first, in the ai-sdk CoreMessage shape.
 */
export async function loadRecentHistory(projectId: string): Promise<CoreMessage[]> {
  const messages = await prisma.message.findMany({
    where: { projectId, role: { in: ["user", "assistant"] }, blocked: false },
    orderBy: { createdAt: "desc" },
    take: MAX_HISTORY_MESSAGES,
  });
  return messages.reverse().map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));
}

export async function loadKnowledgeAndState(projectId: string) {
  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
  return {
    knowledge: parseProjectKnowledge(project.knowledge),
    interviewState: parseInterviewState(project.interviewState),
  };
}
