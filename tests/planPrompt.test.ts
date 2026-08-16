import { describe, expect, it } from "vitest";
import type { DecisionRecord } from "@prisma/client";
import { buildPlanPrompt } from "@/lib/llm/planPrompt";
import { parseProjectKnowledge } from "@/lib/knowledge/types";

function fakeDecision(overrides: Partial<DecisionRecord> = {}): DecisionRecord {
  return {
    id: "d1",
    projectId: "p1",
    number: 1,
    title: "Use PostgreSQL",
    section: "technology",
    decision: "Use PostgreSQL as the primary database.",
    rationale: "Entities are highly relational.",
    alternatives: "",
    tradeoffs: "",
    consequences: "",
    learnMore: [],
    status: "accepted",
    createdAt: new Date(),
    ...overrides,
  };
}

describe("buildPlanPrompt", () => {
  it("includes the project name and the required output sections", () => {
    const prompt = buildPlanPrompt("Convention Registration System", parseProjectKnowledge({}), []);
    expect(prompt).toContain("Convention Registration System");
    expect(prompt).toContain("## Milestones");
    expect(prompt).toContain("## Open Questions");
  });

  it("notes when no decisions exist yet rather than inventing any", () => {
    const prompt = buildPlanPrompt("X", parseProjectKnowledge({}), []);
    expect(prompt).toContain("no decisions recorded yet");
  });

  it("lists real decisions by number and title", () => {
    const prompt = buildPlanPrompt("X", parseProjectKnowledge({}), [fakeDecision()]);
    expect(prompt).toContain("Decision #1");
    expect(prompt).toContain("Use PostgreSQL");
  });
});
