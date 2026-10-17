import type { ProjectKnowledge } from "@/lib/knowledge/types";
import { WIZARD_CATALOG, type WizardOption, type WizardStep } from "@/lib/wizard/catalog";

export type ResolvedChoice = { step: WizardStep; option: WizardOption };

/**
 * Recovers which option was picked at each wizard step. applyAnswer.ts writes the picked
 * option's label into knowledge[step.topic][step.field] (as a string, or appended to an array
 * for `multi` steps), so a step's pick is the option whose label is found in that field.
 * Steps not answered yet are omitted. Returns [] for a project type with no catalog.
 */
export function resolveWizardChoices(projectType: string, knowledge: ProjectKnowledge): ResolvedChoice[] {
  const steps = WIZARD_CATALOG[projectType] ?? [];
  const choices: ResolvedChoice[] = [];

  for (const step of steps) {
    const section = knowledge[step.topic] as Record<string, unknown>;
    const stored = section[step.field];
    const option = step.options.find((o) =>
      Array.isArray(stored) ? stored.includes(o.label) : stored === o.label
    );
    if (option) choices.push({ step, option });
  }

  return choices;
}
