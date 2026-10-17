import { describe, expect, it } from "vitest";
import { WIZARD_CATALOG } from "@/lib/wizard/catalog";
import {
  ASSESSMENT_DIMENSIONS,
  COST_BUCKETS,
  OPTION_ASSESSMENTS,
  getStepAssessments,
  type OptionAssessment,
} from "@/lib/wizard/assessments";

const LEVELS = ["Low", "Medium", "High"];

const assessedSteps = Object.entries(WIZARD_CATALOG).flatMap(([type, steps]) =>
  steps.filter((s) => s.topic !== "requirements").map((step) => ({ type, step }))
);

function textOf(a: OptionAssessment, key: (typeof ASSESSMENT_DIMENSIONS)[number]["key"]): string {
  const value = a[key];
  return typeof value === "string" ? value : value.notes;
}

describe("OPTION_ASSESSMENTS", () => {
  it("covers every option on every architecture/technology step", () => {
    expect(assessedSteps.length).toBeGreaterThan(0);
    for (const { type, step } of assessedSteps) {
      const forStep = getStepAssessments(step.id);
      expect(forStep, `${type}/${step.id} has no assessments`).toBeDefined();
      for (const opt of step.options) {
        expect(forStep![opt.id], `${type}/${step.id} option "${opt.label}" has no assessment`).toBeDefined();
      }
    }
  });

  it("has no entries for steps or options that don't exist in the wizard catalog", () => {
    const stepsById = new Map(assessedSteps.map(({ step }) => [step.id, step]));
    for (const [stepId, byOption] of Object.entries(OPTION_ASSESSMENTS)) {
      const step = stepsById.get(stepId);
      expect(step, `assessment for unknown step "${stepId}"`).toBeDefined();
      const optionIds = new Set(step!.options.map((o) => o.id));
      for (const optionId of Object.keys(byOption)) {
        expect(optionIds.has(optionId), `assessment for unknown option ${stepId}/${optionId}`).toBe(true);
      }
    }
  });

  it("fills every dimension with real text and valid ratings", () => {
    for (const [stepId, byOption] of Object.entries(OPTION_ASSESSMENTS)) {
      for (const [optionId, a] of Object.entries(byOption)) {
        const where = `${stepId}/${optionId}`;
        for (const { key } of ASSESSMENT_DIMENSIONS) {
          expect(textOf(a, key).trim().length, `${where} has empty "${key}"`).toBeGreaterThan(0);
        }
        expect(COST_BUCKETS as readonly string[], `${where} cost bucket`).toContain(a.cost.bucket);
        expect(LEVELS, `${where} deployment complexity`).toContain(a.deployment.complexity);
        expect(LEVELS, `${where} scalability level`).toContain(a.scalability.level);
      }
    }
  });

  it("returns undefined for requirements steps", () => {
    expect(getStepAssessments("static-website-audience")).toBeUndefined();
  });
});
