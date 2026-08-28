import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { buildInterviewTools } from "@/lib/llm/interviewTools";
import { emptyProjectKnowledge, initialInterviewState } from "@/lib/knowledge/defaults";

// Per docs/testing-standards.md: skip (don't fail) if the shared local Postgres isn't running,
// and give every row this test creates an unambiguous marker so it never collides with real data.
const TEST_PROJECT_NAME = "architectcoach-integration-test-interview-tools";

let dbAvailable = false;
let projectId = "";

beforeAll(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbAvailable = true;
  } catch {
    console.warn(
      "Skipping interviewTools integration test — Postgres not reachable. Start it with `docker compose up -d`."
    );
    return;
  }

  const project = await prisma.project.create({
    data: {
      name: TEST_PROJECT_NAME,
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

describe("buildInterviewTools against real Postgres", () => {
  it("update_architecture merges a patch into Project.knowledge.architecture", async () => {
    if (!dbAvailable) return;
    // Cast to `any`: these tools are invoked directly here (not by the model), so the exact
    // `ai` SDK Tool<> generic signature isn't relevant to what this test is checking.
    const tools = buildInterviewTools(projectId) as any;

    await tools.update_architecture.execute(
      { style: "Modular monolith", components: ["API", "Worker"] },
      {}
    );

    const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
    const knowledge = project.knowledge as { architecture: { style: string; components: string[] } };
    expect(knowledge.architecture.style).toBe("Modular monolith");
    expect(knowledge.architecture.components).toEqual(["API", "Worker"]);
  });

  it("update_requirements unions array patches instead of overwriting them", async () => {
    if (!dbAvailable) return;
    // Cast to `any`: these tools are invoked directly here (not by the model), so the exact
    // `ai` SDK Tool<> generic signature isn't relevant to what this test is checking.
    const tools = buildInterviewTools(projectId) as any;

    await tools.update_requirements.execute({ goals: ["fast checkout"] }, {});
    await tools.update_requirements.execute({ goals: ["low no-show rate"] }, {});

    const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
    const knowledge = project.knowledge as { requirements: { goals: string[] } };
    expect(knowledge.requirements.goals).toEqual(
      expect.arrayContaining(["fast checkout", "low no-show rate"])
    );
    expect(knowledge.requirements.goals).toHaveLength(2);
  });

  it("present_choice persists options with generated ids to Project.pendingChoice", async () => {
    if (!dbAvailable) return;
    // Cast to `any`: these tools are invoked directly here (not by the model), so the exact
    // `ai` SDK Tool<> generic signature isn't relevant to what this test is checking.
    const tools = buildInterviewTools(projectId) as any;

    await tools.present_choice.execute(
      {
        topic: "technology",
        question: "Where should this be hosted?",
        options: [
          { label: "Vercel", summary: "Managed platform.", tradeoffs: "Less infra control.", recommended: true },
          { label: "AWS", summary: "Full control.", tradeoffs: "More ops overhead." },
        ],
      },
      {}
    );

    const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
    const pendingChoice = project.pendingChoice as {
      topic: string;
      options: { id: string; label: string; recommended: boolean }[];
    };
    expect(pendingChoice.topic).toBe("technology");
    expect(pendingChoice.options.map((o) => o.id)).toEqual(["0", "1"]);
    expect(pendingChoice.options[0]?.label).toBe("Vercel");
    expect(pendingChoice.options[0]?.recommended).toBe(true);
  });

  it("record_decision assigns sequential numbers per project", async () => {
    if (!dbAvailable) return;
    // Cast to `any`: these tools are invoked directly here (not by the model), so the exact
    // `ai` SDK Tool<> generic signature isn't relevant to what this test is checking.
    const tools = buildInterviewTools(projectId) as any;

    const decisionInput = {
      title: "Use PostgreSQL",
      section: "technology" as const,
      decision: "Use PostgreSQL as the primary database.",
      rationale: "Entities are highly relational.",
      alternatives: "",
      tradeoffs: "",
      consequences: "",
      learnMore: [],
    };

    const first = (await tools.record_decision.execute(decisionInput, {})) as {
      recorded: { number: number };
    };
    const second = (await tools.record_decision.execute(
      { ...decisionInput, title: "Use Auth0", decision: "Use Auth0 for authentication." },
      {}
    )) as { recorded: { number: number } };

    expect(first.recorded.number).toBe(1);
    expect(second.recorded.number).toBe(2);

    const decisions = await prisma.decisionRecord.findMany({
      where: { projectId },
      orderBy: { number: "asc" },
    });
    expect(decisions.map((d) => d.number)).toEqual([1, 2]);
  });
});
