import { describe, expect, it } from "vitest";
import {
  parseInterviewState,
  parsePendingChoice,
  parseProjectKnowledge,
  RecordDecisionInputSchema,
  sectionCompletion,
} from "@/lib/knowledge/types";

describe("parseProjectKnowledge", () => {
  it("fills in a full default shape from an empty object", () => {
    const knowledge = parseProjectKnowledge({});
    expect(knowledge.requirements.purpose).toBe("");
    expect(knowledge.requirements.users).toEqual([]);
    expect(knowledge.architecture.components).toEqual([]);
    expect(knowledge.technology.thirdPartyServices).toEqual([]);
    expect(knowledge.developmentPlan.markdown).toBe("");
  });

  it("never throws on garbage input — falls back to defaults", () => {
    expect(() => parseProjectKnowledge(null)).not.toThrow();
    expect(() => parseProjectKnowledge("not an object")).not.toThrow();
    expect(() => parseProjectKnowledge(42)).not.toThrow();
    expect(parseProjectKnowledge(null)).toEqual(parseProjectKnowledge({}));
  });

  it("preserves partial real data and defaults untouched sections", () => {
    const knowledge = parseProjectKnowledge({
      requirements: { purpose: "Track convention registrations", users: ["attendees", "staff"] },
    });
    expect(knowledge.requirements.purpose).toBe("Track convention registrations");
    expect(knowledge.requirements.users).toEqual(["attendees", "staff"]);
    expect(knowledge.architecture.style).toBe("");
  });
});

describe("parseInterviewState", () => {
  it("defaults to getting-started with no completed topics", () => {
    const state = parseInterviewState({});
    expect(state.currentTopic).toBe("getting-started");
    expect(state.completedTopics).toEqual([]);
  });
});

describe("sectionCompletion", () => {
  it("reports false for every section on an empty project", () => {
    const completion = sectionCompletion(parseProjectKnowledge({}));
    expect(completion).toEqual({
      requirements: false,
      architecture: false,
      technology: false,
      developmentPlan: false,
    });
  });

  it("flips true once a section has real content", () => {
    const knowledge = parseProjectKnowledge({
      requirements: { purpose: "x" },
      technology: { database: "PostgreSQL" },
    });
    const completion = sectionCompletion(knowledge);
    expect(completion.requirements).toBe(true);
    expect(completion.technology).toBe(true);
    expect(completion.architecture).toBe(false);
  });
});

describe("parsePendingChoice", () => {
  it("returns null for null or missing input", () => {
    expect(parsePendingChoice(null)).toBeNull();
    expect(parsePendingChoice(undefined)).toBeNull();
  });

  it("returns null for garbage that doesn't match the shape", () => {
    expect(parsePendingChoice("not a choice")).toBeNull();
    expect(parsePendingChoice({ topic: "technology" })).toBeNull();
    expect(parsePendingChoice({ topic: "technology", question: "Which database?", options: [] })).toBeNull();
  });

  it("parses a valid pending choice", () => {
    const choice = parsePendingChoice({
      topic: "technology",
      question: "Which database fits best?",
      options: [
        { id: "0", label: "PostgreSQL", summary: "Relational.", tradeoffs: "More setup.", recommended: true },
        { id: "1", label: "MongoDB", summary: "Document store.", tradeoffs: "Weaker consistency." },
      ],
    });
    expect(choice?.topic).toBe("technology");
    expect(choice?.options).toHaveLength(2);
    expect(choice?.options[0]?.recommended).toBe(true);
    expect(choice?.options[1]?.recommended).toBe(false);
  });
});

describe("RecordDecisionInputSchema", () => {
  it("requires title/section/decision/rationale", () => {
    const result = RecordDecisionInputSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts a minimal valid decision and defaults optional fields", () => {
    const result = RecordDecisionInputSchema.parse({
      title: "Use PostgreSQL",
      section: "technology",
      decision: "Use PostgreSQL as the primary database.",
      rationale: "Entities are highly relational.",
    });
    expect(result.alternatives).toBe("");
    expect(result.learnMore).toEqual([]);
  });
});
