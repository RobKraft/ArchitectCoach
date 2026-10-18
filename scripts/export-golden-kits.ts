/**
 * Writes the exact files the Next.js app's kit generators produce for a fixed set of wizard
 * answers, as golden files for the .NET port's parity tests
 * (dotnet/tests/ArchitectCoach.Tests/Golden). Answers are applied the same way applyAnswer.ts
 * does, and decisions get a fixed date so output is deterministic.
 *
 * Run from the repo root:  npx tsx scripts/export-golden-kits.ts
 */
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { DecisionRecord } from "@prisma/client";
import { parseProjectKnowledge, type ProjectKnowledge } from "../src/lib/knowledge/types";
import { WIZARD_CATALOG } from "../src/lib/wizard/catalog";
import { generateSpecKitFiles } from "../src/lib/speckit/generate";
import { DEVKIT_SUPPORTED_TYPES, generateDevKitFiles } from "../src/lib/devkit/generate";

const outRoot = join(__dirname, "..", "dotnet", "tests", "ArchitectCoach.Tests", "Golden");
const FIXED_DATE = new Date("2026-01-02T00:00:00Z");

type Case = { name: string; type: string; purpose: string; pick: number; answerSteps?: number };

const cases: Case[] = Object.keys(WIZARD_CATALOG).flatMap((type, t) =>
  [0, 1, 2].map((pick) => ({
    name: `${type.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-pick${pick}`,
    type,
    purpose: pick === 1 ? `Team's "booking" site & admin <beta>` : pick === 2 ? "" : `Project ${t} purpose`,
    pick,
  }))
);
cases.push({ name: "static-website-partial", type: "Static website", purpose: "Half done", pick: 0, answerSteps: 2 });

function answer(c: Case): { knowledge: ProjectKnowledge; decisions: DecisionRecord[] } {
  const knowledge = parseProjectKnowledge({ requirements: { purpose: c.purpose } });
  const decisions: DecisionRecord[] = [];
  const steps = WIZARD_CATALOG[c.type]!.slice(0, c.answerSteps ?? Infinity);

  for (const step of steps) {
    const option = step.options[Math.min(c.pick, step.options.length - 1)]!;
    const section = knowledge[step.topic] as Record<string, unknown>;
    const existing = section[step.field];
    section[step.field] = step.multi
      ? Array.from(new Set([...((existing as string[]) ?? []), option.label]))
      : option.label;

    if (step.recordDecision) {
      decisions.push({
        id: `d${decisions.length + 1}`,
        projectId: "p",
        number: decisions.length + 1,
        title: step.recordDecision.title,
        section: step.topic,
        decision: `${option.label} (for: "${step.question}")`,
        rationale: option.summary,
        alternatives: step.options.filter((o) => o.id !== option.id).map((o) => `${o.label} — ${o.summary}`).join(" "),
        tradeoffs: option.tradeoffs,
        consequences: step.recordDecision.consequences ?? "",
        learnMore: [],
        status: "accepted",
        createdAt: FIXED_DATE,
      });
    }
  }
  return { knowledge, decisions };
}

rmSync(outRoot, { recursive: true, force: true });
const manifest: Record<string, Omit<Case, "name">> = {};

for (const c of cases) {
  const { knowledge, decisions } = answer(c);
  // Same merge as the download route: Dev Kit docs (supported types only), then Spec Kit files.
  const files = {
    ...(DEVKIT_SUPPORTED_TYPES.has(c.type) ? generateDevKitFiles(c.type, knowledge, decisions) : {}),
    ...generateSpecKitFiles(c.type, knowledge),
  };
  for (const [path, content] of Object.entries(files)) {
    const full = join(outRoot, c.name, path);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, content, "utf8");
  }
  const { name, ...rest } = c;
  manifest[name] = rest;
  console.log(`${c.name}: ${Object.keys(files).length} files`);
}

writeFileSync(join(outRoot, "cases.json"), JSON.stringify(manifest, null, 2) + "\n", "utf8");
