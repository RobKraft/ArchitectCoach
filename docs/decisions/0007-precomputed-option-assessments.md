# ADR-0007: Pre-written option assessments in TypeScript, not AI-generated or database-stored

**Status:** Accepted
**Date:** 2026-10-17

## Context

Each wizard option (`src/lib/wizard/catalog.ts`) had one `tradeoffs` paragraph. That doesn't
answer the questions an architect actually needs answered before picking an option: how hard is
deployment, how many accounts/integrations will I manage, ballpark cost, security concerns,
scalability, governance/risk/compliance (GRC), how to audit for correctness, how to stay on top
of costs, and expected performance. The product owner wants all of these answered for every
option **without any AI call on the deployed site** — answers must be fixed, reviewable content.

## Decision

Every option on an architecture/technology step (60 options across the 5 project types) gets an
`OptionAssessment` covering the nine dimensions above, hand-authored ahead of time in
`src/lib/wizard/assessments/` (one file per project type, keyed by step id → option id). Costs
are coarse buckets — `Free`, `~$1/mo`, `~$10/mo`, `~$50/mo`, `~$100/mo`, `$100+/mo` — plus a
sentence on what drives the cost up, stamped with `ASSESSMENTS_AS_OF`. Deployment complexity and
scalability carry a Low/Medium/High level so options can be compared at a glance.

The interview page (a Server Component) looks up only the current step's assessments and passes
them to the client, which renders a compare table and a per-option "Deep dive."
`tests/optionAssessments.test.ts` fails the build if any assessed-step option is missing an entry
or has an empty dimension, so the content can't silently drift from the catalog.

Requirements steps ("who is this for", "main goal") have no assessments — cost/security/scale
don't apply to an audience choice.

## Alternatives considered

- **JSON content seeded into Postgres (`prisma db seed`).** Gives a "database of answers" and
  allows later editing without a deploy, but adds tables, a seed step, and a second copy of
  content that must stay in sync with `catalog.ts`. Rejected by the product owner in favor of
  keeping content in TypeScript next to the catalog.
- **Database as source of truth with an admin edit page.** Easiest to tweak, but requires
  authentication before any deployment (none exists — see `docs/security-checklist.md`) and loses
  git review/history of content changes.
- **Generate answers with an LLM at request time.** Explicitly ruled out: the deployed site must
  not need an AI key, and answers should be consistent and reviewable.
- **Precise cost calculator per user-entered volume.** Rejected: false precision. Ballpark
  buckets are what's needed to compare options; vendor prices change too often to promise more.

## Consequences

- No AI, no database read, and no network call to answer any of these questions — the content
  ships with the code and is reviewed in git like code.
- Changing any answer requires a code change and deploy. Acceptable while one person authors it.
- **Cost buckets go stale.** Vendor pricing changes; `ASSESSMENTS_AS_OF` must be bumped after
  each review. Nothing enforces a review cadence yet.
- Adding a new option to `catalog.ts` now also requires writing its assessment (the test makes
  this mandatory, which is the intent).
- Assessments describe each option in isolation at small-project scale; they don't yet combine
  across choices (e.g. "serverless hosting + SQLite" being incompatible) or reflect the specific
  answers a developer has already given. The chosen option's assessment is not copied into its
  Decision Record. It does appear in the downloadable Spec Kit's `decisions.md` (ADR-0008).
