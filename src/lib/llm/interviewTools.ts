import { tool } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  ArchitectureSchema,
  RequirementsSchema,
  TechnologySchema,
  parseInterviewState,
  parseProjectKnowledge,
  type ProjectKnowledge,
} from "@/lib/knowledge/types";

/** Patch schemas: every field optional — the model only sends what it actually learned. */
const RequirementsPatch = RequirementsSchema.partial();
const ArchitecturePatch = ArchitectureSchema.partial();
const TechnologyPatch = TechnologySchema.partial();

/**
 * Merge a patch into a knowledge section. Arrays are unioned (deduped), not
 * overwritten — the model calls these tools incrementally as the conversation
 * progresses, so "here's one more functional requirement" shouldn't erase the ones
 * already recorded.
 */
function mergeSection<T extends Record<string, unknown>>(current: T, patch: Partial<T>): T {
  const merged: Record<string, unknown> = { ...current };
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    const existing = merged[key];
    if (Array.isArray(value) && Array.isArray(existing)) {
      merged[key] = Array.from(new Set([...existing, ...value]));
    } else {
      merged[key] = value;
    }
  }
  return merged as T;
}

async function patchKnowledge(
  projectId: string,
  section: "requirements" | "architecture" | "technology",
  patch: Record<string, unknown>
): Promise<ProjectKnowledge> {
  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
  const knowledge = parseProjectKnowledge(project.knowledge);
  const updated: ProjectKnowledge = {
    ...knowledge,
    [section]: mergeSection(knowledge[section] as Record<string, unknown>, patch),
  };
  await prisma.project.update({
    where: { id: projectId },
    data: { knowledge: updated as object },
  });
  return updated;
}

/**
 * Tools bound to one project. The model can call these mid-conversation; each one
 * writes straight to Postgres so the persistent project pages update live and the
 * developer can resume later from exactly this state.
 */
export function buildInterviewTools(projectId: string) {
  return {
    update_requirements: tool({
      description:
        "Record or update what's known about the project's requirements: purpose, users, goals, non-goals, functional requirements. Send only the fields you have new information for.",
      parameters: RequirementsPatch,
      execute: async (patch) => {
        const knowledge = await patchKnowledge(projectId, "requirements", patch);
        return { updated: knowledge.requirements };
      },
    }),

    update_architecture: tool({
      description:
        "Record or update the project's architecture: style (e.g. modular monolith, microservices, serverless), major components, data flow, notes. Send only the fields you have new information for.",
      parameters: ArchitecturePatch,
      execute: async (patch) => {
        const knowledge = await patchKnowledge(projectId, "architecture", patch);
        return { updated: knowledge.architecture };
      },
    }),

    update_technology: tool({
      description:
        "Record or update the project's technology choices: frontend, backend, database, hosting, authentication, third-party services. Send only the fields you have new information for.",
      parameters: TechnologyPatch,
      execute: async (patch) => {
        const knowledge = await patchKnowledge(projectId, "technology", patch);
        return { updated: knowledge.technology };
      },
    }),

    record_decision: tool({
      description:
        "Record a significant decision as a permanent Decision Record: what was decided, why, what alternatives were considered, the tradeoffs, and the consequences. Use this for anything non-trivial (a technology choice, an architecture style, a scope boundary) — not for routine chit-chat.",
      parameters: z.object({
        title: z.string().min(1),
        section: z.enum(["requirements", "architecture", "technology", "other"]),
        decision: z.string().min(1).describe("What was decided, stated plainly."),
        rationale: z.string().min(1).describe("Why this was the right call."),
        alternatives: z
          .string()
          .default("")
          .describe("Other options considered and why they were set aside."),
        tradeoffs: z.string().default("").describe("What this choice costs, not just what it buys."),
        consequences: z
          .string()
          .default("")
          .describe("What this locks in or affects going forward."),
        learnMore: z
          .array(z.string())
          .default([])
          .describe("1-3 short topics a developer could look up to understand this decision better."),
      }),
      execute: async (input) => {
        const count = await prisma.decisionRecord.count({ where: { projectId } });
        const record = await prisma.decisionRecord.create({
          data: {
            projectId,
            number: count + 1,
            title: input.title,
            section: input.section,
            decision: input.decision,
            rationale: input.rationale,
            alternatives: input.alternatives,
            tradeoffs: input.tradeoffs,
            consequences: input.consequences,
            learnMore: input.learnMore,
          },
        });
        return { recorded: { number: record.number, title: record.title } };
      },
    }),

    set_interview_progress: tool({
      description:
        "Mark the current interview topic and which topics are fully settled. Call this once a topic (e.g. 'requirements', 'architecture', 'technology') is genuinely done, so it isn't re-asked.",
      parameters: z.object({
        currentTopic: z.string(),
        completedTopics: z.array(z.string()).default([]),
      }),
      execute: async (input) => {
        const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
        const state = parseInterviewState(project.interviewState);
        const merged = {
          currentTopic: input.currentTopic,
          completedTopics: Array.from(
            new Set([...state.completedTopics, ...input.completedTopics])
          ),
        };
        await prisma.project.update({
          where: { id: projectId },
          data: { interviewState: merged },
        });
        return { updated: merged };
      },
    }),
  };
}
