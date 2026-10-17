import { describe, expect, it } from "vitest";
import type { DecisionRecord } from "@prisma/client";
import { generateDevKitFiles } from "@/lib/devkit/generate";
import { parseProjectKnowledge } from "@/lib/knowledge/types";

function fakeDecision(overrides: Partial<DecisionRecord> = {}): DecisionRecord {
  return {
    id: "d1",
    projectId: "p1",
    number: 1,
    title: "Static website hosting",
    section: "technology",
    decision: "Netlify",
    rationale: "Free tier and webhook rebuilds fit this project.",
    alternatives: "GitHub Pages — no CMS webhook support.",
    tradeoffs: "Free tier is generous, but rebuild minutes are metered.",
    consequences: "Determines the publish workflow.",
    learnMore: ["Static site hosting tradeoffs"],
    status: "accepted",
    createdAt: new Date("2026-01-01"),
    ...overrides,
  };
}

describe("generateDevKitFiles", () => {
  it("produces every expected doc plus one ADR per decision", () => {
    const knowledge = parseProjectKnowledge({
      requirements: { purpose: "A portfolio site", users: ["Personal portfolio or blog"] },
      technology: { hosting: "Netlify", thirdPartyServices: ["Privacy-friendly analytics (e.g. Plausible, Fathom)"] },
      architecture: { style: "Static site generator (e.g. Eleventy, Hugo, Jekyll)" },
    });
    const files = generateDevKitFiles("Static website", knowledge, [fakeDecision()]);

    for (const path of [
      "README.md",
      "docs/coding-standards.md",
      "docs/testing-standards.md",
      "docs/security-checklist.md",
      "docs/performance-checklist.md",
      "docs/cost-checklist.md",
      "docs/accessibility-checklist.md",
      "docs/definition-of-done.md",
      "docs/review-checklist.md",
      "docs/ai-collaboration.md",
      "docs/local-setup-checklist.md",
      ".github/PULL_REQUEST_TEMPLATE.md",
      "docs/decisions/README.md",
      "docs/decisions/0001-static-website-hosting.md",
    ]) {
      expect(files[path], `missing ${path}`).toBeDefined();
      expect(files[path]!.length).toBeGreaterThan(0);
    }
  });

  it("tailors content to the actual answers instead of leaving placeholders", () => {
    const knowledge = parseProjectKnowledge({
      requirements: { purpose: "A portfolio site" },
      technology: { hosting: "Netlify", thirdPartyServices: ["Google Analytics"] },
      architecture: { style: "Plain HTML, CSS, and JavaScript" },
    });
    const files = generateDevKitFiles("Static website", knowledge, []);

    expect(files["README.md"]).toContain("A portfolio site");
    expect(files["docs/coding-standards.md"]).toContain("no build step");
    expect(files["docs/security-checklist.md"]).toContain("Google Analytics");
    expect(files["docs/security-checklist.md"]).toContain("cookie-consent");
    expect(files["docs/cost-checklist.md"]).toContain("Netlify");
  });

  it("is honest about undecided fields instead of inventing an answer", () => {
    const files = generateDevKitFiles("Static website", parseProjectKnowledge({}), []);
    expect(files["docs/coding-standards.md"]).toContain("Not yet decided");
    expect(files["docs/decisions/README.md"]).toContain("None recorded yet");
  });

  it("formats a Decision Record as an ADR with the standard sections", () => {
    const files = generateDevKitFiles("Static website", parseProjectKnowledge({}), [fakeDecision()]);
    const adr = files["docs/decisions/0001-static-website-hosting.md"]!;
    expect(adr).toContain("# ADR-0001: Static website hosting");
    expect(adr).toContain("## Context");
    expect(adr).toContain("## Decision");
    expect(adr).toContain("## Alternatives considered");
    expect(adr).toContain("## Consequences");
    expect(adr).toContain("Static site hosting tradeoffs");
  });
});
