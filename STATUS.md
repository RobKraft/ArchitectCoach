# ArchitectCoach — status / where we left off

Last updated: 2026-08-15

## What's built

The full v0.1 scope from `REQUIREMENTS.md` is implemented: project creation, the tool-calling
interview engine, live-updating Requirements/Architecture/Technology pages, Decision Records
(list + detail, with why/alternatives/tradeoffs/consequences/learn-more), AI-generated development
plan, and save/resume via Postgres. Provider-agnostic LLM access (`LLM_PROVIDER=anthropic|openai`)
is wired through `src/lib/llm/provider.ts`. Full breakdown in `ARCHITECTURE.md`; the reasoning
behind each major choice is in `docs/decisions/` (ADR-0001 through 0004).

## Verified vs. not yet verified

- **Verified for real**: `npm install`, `npx prisma generate`/`migrate dev` against a real local
  Postgres, `tsc --noEmit` (clean), `npm test` (18/18 passing, including the Postgres integration
  test in `tests/interviewTools.integration.test.ts` — actually run against real Postgres, not
  skipped), and `npm run build` (clean production build, all 14 routes compile). The running dev
  server was smoke-tested end to end: created a real project through the UI's API, confirmed every
  page (`/`, overview, requirements, architecture, technology, decisions list + detail, plan)
  returns 200 and renders real seeded data correctly, then cleaned up the test project.
- **Note**: `docker-compose.yml` binds Postgres to host port **5433, not 5432** — this dev machine
  already runs another project's Postgres container on 5432
  ([local-govt-reporter-ai](../local-govt-reporter-ai)). Similarly, `npm run dev`/`start` use port
  **3001**, since 3000 was already bound by another running service on this machine. Both are
  noted in `.env.example`/`docker-compose.yml`/`package.json` — genuine local port conflicts, not
  a documented design decision, so revisit if this ever runs on a machine without those conflicts.
- **Not yet verified against a real LLM**: the interview loop and plan generation need a real
  Anthropic or OpenAI API key in `.env.local`, which wasn't available while building/verifying
  this. The code path is implemented, reasoned through (`ARCHITECTURE.md`'s walkthrough), and its
  non-LLM surroundings (streaming response handling, DB writes, page refresh) are proven by the
  smoke test above — but the actual model conversation hasn't run yet. **This is the immediate
  next step.**

## Not yet done — pick up here

1. **Run it for real.** Set `LLM_PROVIDER` + an API key in `.env.local`, go through an actual
   interview, and watch for: questions asked in a sensible order, whether `update_*`/
   `record_decision` tool calls fire at reasonable points, whether the compact knowledge summary
   (`src/lib/llm/context.ts`) gives the model enough context to avoid re-asking settled questions.
   This is the "does this actually help a developer think better" test the source design
   conversation calls out as the real goal of v0.1 — expect to tune `systemPrompt.ts` after
   watching it run.
2. No CI, no deployment target — both explicitly out of scope for v0.1 (`REQUIREMENTS.md`).
3. Once the interview is verified against a real model: consider whether `maxSteps: 5` in the chat
   route is enough headroom for a turn that both records a decision and updates two knowledge
   sections, or whether it needs raising.

## How to run it locally

```bash
cd apps/ArchitectCoach
docker compose up -d
npm install
npx prisma migrate dev
cp .env.example .env.local        # set LLM_PROVIDER + the matching API key
npm run dev                       # http://localhost:3001
```

See `docs/local-setup-checklist.md` for the full verification checklist.
