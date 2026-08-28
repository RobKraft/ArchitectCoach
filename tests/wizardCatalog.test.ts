import { describe, expect, it } from "vitest";
import { PROJECT_TYPE_OPTIONS } from "@/lib/projectTypes";
import { WIZARD_CATALOG } from "@/lib/wizard/catalog";
import { DECISION_SECTIONS } from "@/lib/knowledge/types";

describe("WIZARD_CATALOG", () => {
  it("has a catalog entry for every project type option", () => {
    for (const opt of PROJECT_TYPE_OPTIONS) {
      expect(WIZARD_CATALOG[opt.label], `missing catalog for "${opt.label}"`).toBeDefined();
      expect(WIZARD_CATALOG[opt.label]!.length).toBeGreaterThan(0);
    }
  });

  it("every step has at least 2 options with unique ids, and a valid topic/section", () => {
    for (const [type, steps] of Object.entries(WIZARD_CATALOG)) {
      for (const step of steps) {
        expect(step.options.length, `${type}/${step.id} needs 2+ options`).toBeGreaterThanOrEqual(2);
        const ids = step.options.map((o) => o.id);
        expect(new Set(ids).size, `${type}/${step.id} has duplicate option ids`).toBe(ids.length);
        expect(DECISION_SECTIONS as readonly string[]).toContain(step.topic);
      }
    }
  });

  it("every step id is unique within its project type", () => {
    for (const [type, steps] of Object.entries(WIZARD_CATALOG)) {
      const ids = steps.map((s) => s.id);
      expect(new Set(ids).size, `${type} has duplicate step ids`).toBe(ids.length);
    }
  });

  it("has at most one recommended option per step", () => {
    for (const [type, steps] of Object.entries(WIZARD_CATALOG)) {
      for (const step of steps) {
        const recommended = step.options.filter((o) => o.recommended);
        expect(recommended.length, `${type}/${step.id} has more than one recommended option`).toBeLessThanOrEqual(1);
      }
    }
  });
});
