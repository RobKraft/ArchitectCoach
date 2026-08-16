import { ProjectKnowledgeSchema, InterviewStateSchema, type ProjectKnowledge, type InterviewState } from "./types";

export function emptyProjectKnowledge(): ProjectKnowledge {
  return ProjectKnowledgeSchema.parse({});
}

export function initialInterviewState(): InterviewState {
  return InterviewStateSchema.parse({});
}
