import { describe, expect, it } from "vitest";
import { MAX_HISTORY_MESSAGES, summarizeKnowledge } from "@/lib/llm/context";
import { parseInterviewState, parseProjectKnowledge } from "@/lib/knowledge/types";

describe("summarizeKnowledge", () => {
  it("marks every field as not yet defined for a fresh project", () => {
    const summary = summarizeKnowledge(parseProjectKnowledge({}), parseInterviewState({}));
    expect(summary).toContain("(not yet defined)");
    expect(summary).toContain("Current interview topic: getting-started");
  });

  it("renders real data instead of placeholders once knowledge exists", () => {
    const knowledge = parseProjectKnowledge({
      requirements: { purpose: "Manage convention registrations", goals: ["fast checkout"] },
      technology: { database: "PostgreSQL" },
    });
    const summary = summarizeKnowledge(knowledge, parseInterviewState({}));
    expect(summary).toContain("Manage convention registrations");
    expect(summary).toContain("fast checkout");
    expect(summary).toContain("PostgreSQL");
  });

  it("stays a small, bounded summary instead of growing unreasonably with knowledge size", () => {
    // The whole point of this function is replacing "send the full transcript" with a
    // compact fixed-shape summary — it shouldn't balloon just because a section has many items.
    const knowledge = parseProjectKnowledge({
      requirements: {
        functionalRequirements: Array.from({ length: 20 }, (_, i) => `Requirement ${i}`),
      },
    });
    const summary = summarizeKnowledge(knowledge, parseInterviewState({}));
    expect(summary.length).toBeLessThan(3000);
  });
});

describe("MAX_HISTORY_MESSAGES", () => {
  it("is a small bounded window, not the full transcript", () => {
    expect(MAX_HISTORY_MESSAGES).toBeGreaterThan(0);
    expect(MAX_HISTORY_MESSAGES).toBeLessThanOrEqual(20);
  });
});
