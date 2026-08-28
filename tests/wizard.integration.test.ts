import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { applyWizardAnswer, WizardAnswerError } from "@/lib/wizard/applyAnswer";
import { WIZARD_CATALOG } from "@/lib/wizard/catalog";
import { emptyProjectKnowledge, initialInterviewState } from "@/lib/knowledge/defaults";
import { parseInterviewState, parseProjectKnowledge } from "@/lib/knowledge/types";

// Per docs/testing-standards.md: skip (don't fail) if the shared local Postgres isn't running.
// Uses the real "Static website" catalog key since applyWizardAnswer looks projects up by name.
let dbAvailable = false;
let projectId = "";

const steps = WIZARD_CATALOG["Static website"];

beforeAll(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbAvailable = true;
  } catch {
    console.warn("Skipping wizard integration test — Postgres not reachable. Start it with `docker compose up -d`.");
    return;
  }

  const project = await prisma.project.create({
    data: {
      name: "Static website",
      knowledge: emptyProjectKnowledge(),
      interviewState: initialInterviewState(),
    },
  });
  projectId = project.id;
});

afterAll(async () => {
  if (dbAvailable && projectId) {
    await prisma.project.delete({ where: { id: projectId } }).catch(() => {});
  }
  await prisma.$disconnect();
});

describe("applyWizardAnswer against real Postgres", () => {
  it("throws for a project type with no catalog", async () => {
    if (!dbAvailable) return;
    const other = await prisma.project.create({
      data: { name: "architectcoach-test-uncataloged-type", knowledge: emptyProjectKnowledge(), interviewState: initialInterviewState() },
    });
    await expect(applyWizardAnswer(other.id, "anything", "0")).rejects.toThrow(WizardAnswerError);
    await prisma.project.delete({ where: { id: other.id } });
  });

  it("rejects an unknown step or option", async () => {
    if (!dbAvailable) return;
    await expect(applyWizardAnswer(projectId, "not-a-real-step", "0")).rejects.toThrow(WizardAnswerError);
    await expect(applyWizardAnswer(projectId, steps![0]!.id, "not-a-real-option")).rejects.toThrow(WizardAnswerError);
  });

  it("rejects answering a step that isn't current", async () => {
    if (!dbAvailable) return;
    // stepIndex is still 0 at this point; step[1] is not yet current.
    await expect(applyWizardAnswer(projectId, steps![1]!.id, "0")).rejects.toThrow(WizardAnswerError);
  });

  it("patches knowledge, records decisions where configured, and advances through every step", async () => {
    if (!dbAvailable) return;

    for (let i = 0; i < steps!.length; i++) {
      const step = steps![i]!;
      const result = await applyWizardAnswer(projectId, step.id, step.options[0]!.id);
      expect(result.done).toBe(i === steps!.length - 1);
    }

    const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
    const knowledge = parseProjectKnowledge(project.knowledge);
    const state = parseInterviewState(project.interviewState);

    expect(state.stepIndex).toBe(steps!.length);
    expect(knowledge.requirements.users).toEqual([steps![0]!.options[0]!.label]);
    expect(knowledge.architecture.style).toBe(steps![2]!.options[0]!.label);
    expect(knowledge.technology.hosting).toBe(steps![3]!.options[0]!.label);

    const decisionCount = steps!.filter((s) => s.recordDecision).length;
    const decisions = await prisma.decisionRecord.findMany({ where: { projectId } });
    expect(decisions).toHaveLength(decisionCount);
  });
});
