import { describe, expect, it } from "vitest";
import type { DecisionRecord } from "@prisma/client";
import { buildDiscussPrompt } from "@/lib/wizard/discussPrompt";
import { parseProjectKnowledge } from "@/lib/knowledge/types";
import { WIZARD_CATALOG } from "@/lib/wizard/catalog";

describe("buildDiscussPrompt", () => {
  const step = WIZARD_CATALOG["Static website"]![3]!; // hosting step

  it("includes the project purpose, the question, and every option's tradeoffs", () => {
    const knowledge = parseProjectKnowledge({ requirements: { purpose: "A portfolio site" } });
    const prompt = buildDiscussPrompt("My Site", knowledge, [], step);

    expect(prompt).toContain("My Site");
    expect(prompt).toContain("A portfolio site");
    expect(prompt).toContain(step.question);
    for (const opt of step.options) {
      expect(prompt).toContain(opt.label);
      expect(prompt).toContain(opt.tradeoffs);
    }
  });

  it("includes prior decisions when present", () => {
    const decision = {
      title: "Build approach",
      decision: "Static site generator",
    } as DecisionRecord;
    const prompt = buildDiscussPrompt("My Site", parseProjectKnowledge({}), [decision], step);
    expect(prompt).toContain("Build approach: Static site generator");
  });

  it("marks the recommended option distinctly", () => {
    const prompt = buildDiscussPrompt("My Site", parseProjectKnowledge({}), [], step);
    const recommended = step.options.find((o) => o.recommended);
    expect(recommended).toBeDefined();
    expect(prompt).toContain(`${recommended!.label} (ArchitectCoach's suggested default)`);
  });
});
