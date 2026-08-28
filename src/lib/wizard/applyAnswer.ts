import { prisma } from "@/lib/db";
import { buildInterviewTools } from "@/lib/llm/interviewTools";
import { parseInterviewState } from "@/lib/knowledge/types";
import { WIZARD_CATALOG } from "@/lib/wizard/catalog";

export class WizardAnswerError extends Error {}

/**
 * Applies one wizard pick: patches Project.knowledge, optionally records a Decision
 * Record, and advances Project.interviewState.stepIndex. Reuses the same
 * update_requirements/update_architecture/update_technology/record_decision execute
 * functions the AI-driven interview calls — no AI call happens here, this just
 * invokes them directly with values read from the static catalog.
 */
export async function applyWizardAnswer(
  projectId: string,
  stepId: string,
  optionId: string
): Promise<{ done: boolean }> {
  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
  const steps = WIZARD_CATALOG[project.name];
  if (!steps) {
    throw new WizardAnswerError(`No wizard catalog for project type "${project.name}"`);
  }

  const state = parseInterviewState(project.interviewState);
  const stepIndex = steps.findIndex((s) => s.id === stepId);
  if (stepIndex === -1) {
    throw new WizardAnswerError(`Unknown step "${stepId}"`);
  }
  if (stepIndex !== state.stepIndex) {
    throw new WizardAnswerError("This step isn't the current step — it may already be answered.");
  }

  const step = steps[stepIndex];
  if (!step) {
    throw new WizardAnswerError(`Unknown step "${stepId}"`);
  }
  const option = step.options.find((o) => o.id === optionId);
  if (!option) {
    throw new WizardAnswerError(`Unknown option "${optionId}" for step "${stepId}"`);
  }

  // Cast to `any`: invoked directly here (not by the model), so the exact `ai` SDK
  // Tool<> generic signature isn't relevant to what this does.
  const tools = buildInterviewTools(projectId) as any;
  const value = step.multi ? [option.label] : option.label;
  await tools[`update_${step.topic}`].execute({ [step.field]: value }, {});

  if (step.recordDecision) {
    const alternatives = step.options
      .filter((o) => o.id !== option.id)
      .map((o) => `${o.label} — ${o.summary}`)
      .join(" ");
    await tools.record_decision.execute(
      {
        title: step.recordDecision.title,
        section: step.topic,
        decision: `${option.label} (for: "${step.question}")`,
        rationale: option.summary,
        alternatives,
        tradeoffs: option.tradeoffs,
        consequences: step.recordDecision.consequences ?? "",
        learnMore: [],
      },
      {}
    );
  }

  const nextStepIndex = stepIndex + 1;
  await prisma.project.update({
    where: { id: projectId },
    data: { interviewState: { ...state, stepIndex: nextStepIndex } },
  });

  return { done: nextStepIndex >= steps.length };
}
