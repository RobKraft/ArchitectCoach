import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { MAX_HISTORY_MESSAGES, loadRecentHistory, summarizeKnowledge } from "@/lib/llm/context";
import { parseInterviewState, parseProjectKnowledge } from "@/lib/knowledge/types";
import { emptyProjectKnowledge, initialInterviewState } from "@/lib/knowledge/defaults";

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

// Per docs/testing-standards.md: skip (don't fail) if the shared local Postgres isn't running,
// and give every row this test creates an unambiguous marker so it never collides with real data.
const TEST_PROJECT_NAME = "architectcoach-integration-test-context";

describe("loadRecentHistory against real Postgres", () => {
  let dbAvailable = false;
  let projectId = "";

  beforeAll(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbAvailable = true;
    } catch {
      console.warn(
        "Skipping context integration test — Postgres not reachable. Start it with `docker compose up -d`."
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

  it("excludes blocked messages from the replayed history", async () => {
    if (!dbAvailable) return;

    await prisma.message.create({ data: { projectId, role: "user", content: "real message" } });
    await prisma.message.create({
      data: { projectId, role: "user", content: "blocked message", blocked: true, blockReason: "off-topic" },
    });
    await prisma.message.create({
      data: { projectId, role: "assistant", content: "refusal", blocked: true },
    });
    await prisma.message.create({ data: { projectId, role: "assistant", content: "real reply" } });

    const history = await loadRecentHistory(projectId);
    const contents = history.map((m) => m.content);
    expect(contents).toContain("real message");
    expect(contents).toContain("real reply");
    expect(contents).not.toContain("blocked message");
    expect(contents).not.toContain("refusal");
  });
});
