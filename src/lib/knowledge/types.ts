import { z } from "zod";

/**
 * The structured "project knowledge model" — what the interview accumulates instead
 * of a raw chat transcript. Each section maps to one of the persistent project pages.
 */

export const RequirementsSchema = z.object({
  purpose: z.string().default(""),
  users: z.array(z.string()).default([]),
  goals: z.array(z.string()).default([]),
  nonGoals: z.array(z.string()).default([]),
  functionalRequirements: z.array(z.string()).default([]),
});
export type Requirements = z.infer<typeof RequirementsSchema>;

export const ArchitectureSchema = z.object({
  style: z.string().default(""),
  components: z.array(z.string()).default([]),
  dataFlow: z.string().default(""),
  notes: z.string().default(""),
});
export type Architecture = z.infer<typeof ArchitectureSchema>;

export const TechnologySchema = z.object({
  frontend: z.string().default(""),
  backend: z.string().default(""),
  database: z.string().default(""),
  hosting: z.string().default(""),
  authentication: z.string().default(""),
  thirdPartyServices: z.array(z.string()).default([]),
});
export type Technology = z.infer<typeof TechnologySchema>;

export const DevelopmentPlanSchema = z.object({
  markdown: z.string().default(""),
  generatedAt: z.string().nullable().default(null),
});
export type DevelopmentPlan = z.infer<typeof DevelopmentPlanSchema>;

export const ProjectKnowledgeSchema = z.object({
  requirements: RequirementsSchema.default({}),
  architecture: ArchitectureSchema.default({}),
  technology: TechnologySchema.default({}),
  developmentPlan: DevelopmentPlanSchema.default({}),
});
export type ProjectKnowledge = z.infer<typeof ProjectKnowledgeSchema>;

export const InterviewStateSchema = z.object({
  currentTopic: z.string().default("getting-started"),
  completedTopics: z.array(z.string()).default([]),
});
export type InterviewState = z.infer<typeof InterviewStateSchema>;

export const DECISION_SECTIONS = [
  "requirements",
  "architecture",
  "technology",
  "other",
] as const;
export type DecisionSection = (typeof DECISION_SECTIONS)[number];

export const RecordDecisionInputSchema = z.object({
  title: z.string().min(1),
  section: z.enum(DECISION_SECTIONS),
  decision: z.string().min(1),
  rationale: z.string().min(1),
  alternatives: z.string().default(""),
  tradeoffs: z.string().default(""),
  consequences: z.string().default(""),
  learnMore: z.array(z.string()).default([]),
});
export type RecordDecisionInput = z.infer<typeof RecordDecisionInputSchema>;

/** Parse-and-fill: never throws on partial/missing data, always returns a full shape. */
export function parseProjectKnowledge(value: unknown): ProjectKnowledge {
  const result = ProjectKnowledgeSchema.safeParse(value);
  return result.success ? result.data : ProjectKnowledgeSchema.parse({});
}

export function parseInterviewState(value: unknown): InterviewState {
  const result = InterviewStateSchema.safeParse(value);
  return result.success ? result.data : InterviewStateSchema.parse({});
}

/**
 * Which of the three interview-driven sections have any real content yet.
 * Drives the progress checklist on the project overview page.
 */
export function sectionCompletion(knowledge: ProjectKnowledge) {
  return {
    requirements:
      knowledge.requirements.purpose.length > 0 ||
      knowledge.requirements.functionalRequirements.length > 0,
    architecture:
      knowledge.architecture.style.length > 0 ||
      knowledge.architecture.components.length > 0,
    technology:
      knowledge.technology.frontend.length > 0 ||
      knowledge.technology.backend.length > 0 ||
      knowledge.technology.database.length > 0,
    developmentPlan: knowledge.developmentPlan.markdown.length > 0,
  };
}
