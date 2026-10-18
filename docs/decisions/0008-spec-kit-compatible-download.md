# ADR-0008: Downloadable kit feeds GitHub Spec Kit; the developer's own AI finishes the spec

**Status:** Accepted
**Date:** 2026-10-17

## Context

The wizard captures a handful of big architecture decisions, which isn't enough to produce a
real spec or task breakdown by itself: entities, roles, user journeys, volume, budget,
compliance, environments, and similar details are still unknown. Asking all of that in the
wizard would make it long and generic. Generating a plan server-side needs an AI key on the
deployed site (the current "Generate plan" button does), which the product owner wants to avoid.
The goal is a download that lets someone go from "decisions made" to "building from a task
list", driven by their own AI coding agent.

## Decision

The completion panel's download (`/api/projects/[id]/devkit`, now labelled "Download Spec Kit")
produces a kit compatible with [GitHub Spec Kit](https://github.com/github/spec-kit) for all 5
wizard project types (`src/lib/speckit/generate.ts`):

- `architectcoach/decisions.md`: every pick, with tradeoffs and its full option assessment
  (ADR-0007).
- `architectcoach/open-questions.md`: what the wizard didn't ask. Universal questions that cover
  the nine assessment dimensions for this project, plus per-project-type questions and per-option
  follow-ups (`src/lib/speckit/openQuestions.ts`), each tagged *spec* or *plan* phase and
  answered in place.
- Inputs for each Spec Kit command: `constitution-input.md` (`/speckit.constitution`, built from
  the chosen options' security/GRC/cost/auditing/performance notes), `feature-brief.md`
  (`/speckit.specify`, what and why only), `tech-context.md` (`/speckit.plan`).
- `AGENTS.md` (with `CLAUDE.md` and `.github/copilot-instructions.md` pointing to it): the agent
  interviews the developer one question at a time, records answers, runs constitution → specify
  → clarify → plan → tasks → analyze → implement, stops for review after each step, and falls back
  to writing `specs/001-first-release/{spec,plan,tasks}.md` itself if Spec Kit isn't installed.
- `architectcoach/privacy-and-accessibility.md` (added 2026-10-18,
  `src/lib/speckit/privacyAccessibility.ts`): PII inventory template, GDPR and CCPA checklists,
  privacy items specific to each project type, a WCAG 2.2 AA checklist adapted to web, phone, or
  desktop, the test approach, and the legal context (ADA Title II/III, Section 508, European
  Accessibility Act). The constitution always includes *Privacy by design* and *Accessible by
  default*, whatever options were picked.
- `SPEC-KIT-START-HERE.md`: human steps (`uv tool install specify-cli`,
  `specify init --here --integration <agent>`, then "Read AGENTS.md and start").

The kit **writes nothing into Spec Kit's managed paths** (`.specify/`, `specs/`, agent command
folders). It supplies inputs to Spec Kit's commands instead. For Static website, the existing
tailored standards and ADRs (`src/lib/devkit/generate.ts`) are included as well.

Which option was picked at each step is recovered from `Project.knowledge`
(`src/lib/wizard/resolveChoices.ts`), since `applyAnswer.ts` writes the option label there. No
schema change was needed.

**.NET implementation (2026-10-18):** `dotnet/src/ArchitectCoach.Web/Services/Kits/` ports both
generators. `GET /projects/{id}/kit` serves the ZIP through the owner-filtered context, and
`KitGoldenTests` checks the output byte for byte against the TypeScript generators' output
for 16 answer sets (`scripts/export-golden-kits.ts` → `dotnet/tests/ArchitectCoach.Tests/Golden/`).

## Alternatives considered

- **Pre-fill Spec Kit's own files** (`.specify/memory/constitution.md`, `specs/001-*/spec.md`).
  Rejected: the layout and command spelling vary across Spec Kit versions and agents
  (`/speckit.plan`, `/speckit-plan`, `$speckit-plan`), and `specify init --force` may replace
  managed files, which would silently discard the pre-filled content.
- **Our own standalone format with no Spec Kit dependency.** Rejected by the product owner in
  favor of an established, maintained workflow. The `AGENTS.md` fallback keeps the kit usable
  without Spec Kit.
- **Ask every question in the wizard and generate the full spec/tasks on the site.** Rejected:
  it makes the wizard long, and producing a good task list from free-text answers needs an LLM,
  which would put an AI key back on the server.

## Consequences

- No AI runs on this site for the kit. The developer's own agent and subscription do the
  interviewing and writing.
- Quality of the final spec/plan/tasks depends on the developer's agent following `AGENTS.md`.
  It's guidance, not enforcement.
- Spec Kit is a moving target. If its command names or init flags change, `SPEC-KIT-START-HERE.md`
  and `AGENTS.md` need updating. Nothing tests against a real Spec Kit install yet.
- The route is still named `/devkit` for compatibility with existing links.
- The AI "Generate plan" button still exists and still needs an API key. It overlaps with this
  kit and is a candidate for removal or demotion.
