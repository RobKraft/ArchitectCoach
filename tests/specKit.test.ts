import { describe, expect, it } from "vitest";
import { parseProjectKnowledge, type ProjectKnowledge } from "@/lib/knowledge/types";
import { WIZARD_CATALOG } from "@/lib/wizard/catalog";
import { resolveWizardChoices } from "@/lib/wizard/resolveChoices";
import { collectOpenQuestions, generateSpecKitFiles } from "@/lib/speckit/generate";
import { OPTION_QUESTIONS, PROJECT_TYPE_QUESTIONS } from "@/lib/speckit/openQuestions";

/** Builds knowledge the same way applyAnswer.ts does, picking option index `pick` (clamped) at every step. */
function answeredKnowledge(projectType: string, pick: number, purpose = "A test project"): ProjectKnowledge {
  const k = parseProjectKnowledge({ requirements: { purpose } });
  for (const step of WIZARD_CATALOG[projectType]!) {
    const option = step.options[Math.min(pick, step.options.length - 1)]!;
    const section = k[step.topic] as Record<string, unknown>;
    if (step.multi) section[step.field] = [...((section[step.field] as string[]) ?? []), option.label];
    else section[step.field] = option.label;
  }
  return k;
}

const SPEC_KIT_FILES = [
  "SPEC-KIT-START-HERE.md",
  "AGENTS.md",
  "CLAUDE.md",
  ".github/copilot-instructions.md",
  "architectcoach/decisions.md",
  "architectcoach/open-questions.md",
  "architectcoach/constitution-input.md",
  "architectcoach/feature-brief.md",
  "architectcoach/tech-context.md",
];

describe("resolveWizardChoices", () => {
  it("recovers the picked option for every answered step", () => {
    const k = answeredKnowledge("Site with a backend/database", 1);
    const choices = resolveWizardChoices("Site with a backend/database", k);
    const steps = WIZARD_CATALOG["Site with a backend/database"]!;
    expect(choices).toHaveLength(steps.length);
    for (const { step, option } of choices) expect(option.id).toBe(step.options[1]!.id);
  });

  it("omits unanswered steps and unknown project types", () => {
    expect(resolveWizardChoices("Phone app", parseProjectKnowledge({}))).toEqual([]);
    expect(resolveWizardChoices("Not a type", answeredKnowledge("Phone app", 0))).toEqual([]);
  });
});

describe("generateSpecKitFiles", () => {
  for (const projectType of Object.keys(WIZARD_CATALOG)) {
    it(`produces a complete kit for "${projectType}"`, () => {
      const files = generateSpecKitFiles(projectType, answeredKnowledge(projectType, 0));
      for (const path of SPEC_KIT_FILES) {
        expect(files[path]?.trim().length, `${projectType}: missing ${path}`).toBeGreaterThan(0);
      }
      // No unfilled template placeholders, and nothing written into Spec Kit's managed paths.
      for (const [path, content] of Object.entries(files)) {
        expect(content, `${path} has "undefined"`).not.toContain("undefined");
        expect(path.startsWith(".specify/") || path.startsWith("specs/"), path).toBe(false);
      }
    });
  }

  it("records each chosen option and its assessment in decisions.md", () => {
    const files = generateSpecKitFiles("Site with a backend/database", answeredKnowledge("Site with a backend/database", 3));
    const decisions = files["architectcoach/decisions.md"]!;
    expect(decisions).toContain("**Chosen:** Microservices");
    expect(decisions).toContain("$100+/mo");
    expect(decisions).toContain("Governance, risk & compliance");
    expect(files["architectcoach/tech-context.md"]).toContain("Container registry");
  });

  it("includes the developer's purpose in the feature brief", () => {
    const files = generateSpecKitFiles("Phone app", answeredKnowledge("Phone app", 0, "Track dog walks"));
    expect(files["architectcoach/feature-brief.md"]).toContain("Track dog walks");
  });

  it("adds option-specific questions only for the options picked", () => {
    const sqlite = collectOpenQuestions(
      "Site with a backend/database",
      resolveWizardChoices("Site with a backend/database", answeredKnowledge("Site with a backend/database", 3))
    ).map((q) => q.question);
    expect(sqlite.some((q) => q.includes("persistent disk"))).toBe(true);

    const postgres = collectOpenQuestions(
      "Site with a backend/database",
      resolveWizardChoices("Site with a backend/database", answeredKnowledge("Site with a backend/database", 0))
    ).map((q) => q.question);
    expect(postgres.some((q) => q.includes("persistent disk"))).toBe(false);
  });
});

describe("open-question catalog", () => {
  it("has per-type questions for every wizard project type, and no unknown types", () => {
    expect(Object.keys(PROJECT_TYPE_QUESTIONS).sort()).toEqual(Object.keys(WIZARD_CATALOG).sort());
  });

  it("only keys option questions to steps and options that exist", () => {
    const valid = new Set(
      Object.values(WIZARD_CATALOG).flatMap((steps) => steps.flatMap((s) => s.options.map((o) => `${s.id}/${o.id}`)))
    );
    for (const key of Object.keys(OPTION_QUESTIONS)) expect(valid.has(key), `unknown option key ${key}`).toBe(true);
  });
});
