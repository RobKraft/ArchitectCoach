/**
 * One-time (re-runnable) export of the hand-written wizard content from the Next.js app's
 * TypeScript into JSON for the .NET rewrite, so nothing is retyped
 * (docs/plans/dotnet-blazor-rewrite.md §10). After the .NET app reaches parity, the JSON files
 * become the source of truth and this script and the TypeScript are deleted.
 *
 * Run from the repo root:  npx tsx scripts/export-content.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PROJECT_TYPE_OPTIONS } from "../src/lib/projectTypes";
import { WIZARD_CATALOG } from "../src/lib/wizard/catalog";
import {
  ASSESSMENT_DIMENSIONS,
  ASSESSMENTS_AS_OF,
  COST_BUCKETS,
  OPTION_ASSESSMENTS,
} from "../src/lib/wizard/assessments";
import { OPTION_QUESTIONS, PROJECT_TYPE_QUESTIONS, UNIVERSAL_QUESTIONS } from "../src/lib/speckit/openQuestions";
import {
  PRIVACY_ACCESSIBILITY_AS_OF,
  PROJECT_TYPE_PLATFORM,
  buildPrivacyAccessibility,
} from "../src/lib/speckit/privacyAccessibility";

const outDir = join(__dirname, "..", "dotnet", "src", "ArchitectCoach.Web", "Content");
mkdirSync(outDir, { recursive: true });

function write(name: string, data: unknown) {
  writeFileSync(join(outDir, name), JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`wrote Content/${name}`);
}

write("wizard.json", {
  projectTypes: PROJECT_TYPE_OPTIONS,
  steps: WIZARD_CATALOG,
});

write("assessments.json", {
  asOf: ASSESSMENTS_AS_OF,
  costBuckets: COST_BUCKETS,
  dimensions: ASSESSMENT_DIMENSIONS,
  byStep: OPTION_ASSESSMENTS,
});

write("open-questions.json", {
  universal: UNIVERSAL_QUESTIONS,
  byProjectType: PROJECT_TYPE_QUESTIONS,
  byOption: OPTION_QUESTIONS,
});

// The privacy/accessibility guidance doesn't depend on a project's answers, so the rendered
// markdown per project type is exported as-is.
write("privacy-accessibility.json", {
  asOf: PRIVACY_ACCESSIBILITY_AS_OF,
  platformByProjectType: PROJECT_TYPE_PLATFORM,
  markdownByProjectType: Object.fromEntries(
    Object.keys(WIZARD_CATALOG).map((type) => [type, buildPrivacyAccessibility(type)])
  ),
});
