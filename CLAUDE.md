# ArchitectCoach — Project Context

This app follows the AI Dev Kit conventions at `C:\Data\DevAI` (see `../../claude.md` for the
standing workflow rules: clarify → propose options → generate → integrate → test → document).

**Required reading before making architectural changes:** `REQUIREMENTS.md` (what this product is
and v0.1's scope), `ARCHITECTURE.md` (what's actually built — component breakdown, data model,
end-to-end walkthrough, what's missing). If a change conflicts with either, flag the conflict and
update the doc rather than silently diverging. Full documentation index:
[`docs/README.md`](docs/README.md). Project standards live in `docs/coding-standards.md`,
`docs/testing-standards.md`, `docs/security-checklist.md` — follow them, and see
`docs/definition-of-done.md` before calling anything finished.

## Current status: v0.1 scope fully implemented and verified except the live LLM turn itself

See `STATUS.md` for the full picture. `npm install`, `tsc --noEmit`, `npm test` (18/18, including
a real-Postgres integration test), `npm run build`, and a live dev-server smoke test (real project
created via the API, every page checked, real seeded data confirmed rendering, cleaned up
afterward) all pass. **Not yet verified against a real Anthropic/OpenAI API key** — the interview
loop and plan generation need one; that's the immediate next step, not a "maybe later." Runs on
ports 3001 (app) / 5433 (Postgres), not the defaults — see ADR-0005, this machine already had
something on 3000/5432.

## Key decisions

See [`docs/decisions/`](docs/decisions/) for the full ADRs. Summary:
- Project knowledge: one typed JSON document per project (`Project.knowledge`), not a fully
  normalized schema — the shape is still settling
  ([ADR-0001](docs/decisions/0001-jsonb-knowledge-model-not-full-normalization.md)).
- Stack: Next.js full-stack (App Router), not a separate ASP.NET Core/FastAPI backend — one
  deployable, simplest hosting for a prototype
  ([ADR-0002](docs/decisions/0002-nextjs-fullstack-single-deployable.md)).
- LLM access: provider-agnostic via the Vercel AI SDK (`ai` + `@ai-sdk/anthropic` +
  `@ai-sdk/openai`), switched by `LLM_PROVIDER` — chosen deliberately over defaulting to one
  provider ([ADR-0003](docs/decisions/0003-provider-agnostic-llm-via-vercel-ai-sdk.md)).
- Local dev: Postgres in Docker Compose only; the app itself runs on the host
  ([ADR-0004](docs/decisions/0004-docker-compose-postgres-only.md)).
- Non-default local ports (3001 for the app, 5433 for Postgres) — this dev machine already had
  other projects/services on 3000/5432
  ([ADR-0005](docs/decisions/0005-non-default-local-ports.md)).
- All writes during the interview go through `src/lib/llm/interviewTools.ts` — the LLM is the only
  caller; no page/route patches `Project.knowledge` or creates a `DecisionRecord` directly (see
  `ARCHITECTURE.md`'s layering rule).
- Cost control: the model is never sent the full conversation transcript — a compact rendered
  summary of current `ProjectKnowledge` plus the last `MAX_HISTORY_MESSAGES` (10) messages only
  (`src/lib/llm/context.ts`).

## Immediate next step

Run it for real against a live API key and watch the interview behave (question ordering, whether
tool calls fire at sensible points, whether the compact context is enough for the model to avoid
re-asking settled questions) — see `STATUS.md` item 1. `npm install` also has not been executed in
this environment; verify it resolves cleanly before anything else.
