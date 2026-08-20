# ArchitectCoach — status / where we left off

Last updated: 2026-08-20

## What's built

The full v0.1 scope from `REQUIREMENTS.md` is implemented: project creation, the tool-calling
interview engine, live-updating Requirements/Architecture/Technology pages, Decision Records
(list + detail, with why/alternatives/tradeoffs/consequences/learn-more), AI-generated development
plan, and save/resume via Postgres. Provider-agnostic LLM access (`LLM_PROVIDER=anthropic|openai`)
is wired through `src/lib/llm/provider.ts`. A pre-call moderation gate
(`src/lib/llm/moderation.ts`, [ADR-0006](docs/decisions/0006-pre-call-moderation-gate.md)) now
checks every chat message for on-topic/safety before the coaching model runs, fails closed on
error, and logs blocked attempts to `Message.blocked`/`blockReason`. Full breakdown in
`ARCHITECTURE.md`; the reasoning behind each major choice is in `docs/decisions/` (ADR-0001
through 0006).

## Verified vs. not yet verified

- **Verified for real**: `npm install`, `npx prisma generate`/`migrate dev` against a real local
  Postgres (including the `add_message_blocked_flag` migration), `tsc --noEmit` (clean), lint
  (clean), `npm test` (24/24 passing, including the Postgres integration tests in
  `tests/interviewTools.integration.test.ts` and `tests/context.test.ts` — actually run against
  real Postgres, not skipped), and `npm run build` (clean production build). The running dev
  server was smoke-tested end to end: created a real project through the UI's API, confirmed every
  page (`/`, overview, requirements, architecture, technology, decisions list + detail, plan)
  returns 200 and renders real seeded data correctly, then cleaned up the test project.
- **Note**: `docker-compose.yml` binds Postgres to host port **5433, not 5432** — this dev machine
  already runs another project's Postgres container on 5432
  ([local-govt-reporter-ai](../local-govt-reporter-ai)). Similarly, `npm run dev`/`start` use port
  **3001**, since 3000 was already bound by another running service on this machine. Both are
  noted in `.env.example`/`docker-compose.yml`/`package.json` — genuine local port conflicts, not
  a documented design decision, so revisit if this ever runs on a machine without those conflicts.
- **Verified against a real LLM, partially**: a real Anthropic key was added and one real interview
  turn was run, which is how a bug was caught — the route was streaming the `ai` SDK's data-stream
  protocol (`toDataStreamResponse()`) instead of the plain text ADR-0003 calls for, so raw protocol
  frames were rendering as chat text. Fixed by reverting the route to `toTextStreamResponse()` and
  the client to plain-text accumulation (`ChatPanel.tsx`), plus switching assistant messages to
  render through `ReactMarkdown`. **Not yet re-verified live**: the moderation gate
  (`src/lib/llm/moderation.ts`, ADR-0006) is new code with no live model call behind it yet — the
  one real turn observed so far predates it. Re-run a live interview to confirm the gate passes
  on-topic messages through cleanly and blocks off-topic/unsafe ones without an unhandled error.

## Not yet done — pick up here

1. **Re-verify live, now that the moderation gate and streaming fix have landed.** Go through an
   actual interview and confirm: replies render as clean markdown (not raw protocol text), an
   on-topic message flows through to the coaching model normally, an off-topic message
   ("what's a good pasta recipe?") is refused without a `streamText` call firing, and a
   security-architecture question (e.g. "how do I prevent SQL injection") is correctly treated as
   on-topic rather than flagged. Also watch for the pre-existing open item: whether `update_*`/
   `record_decision` tool calls fire at reasonable points, and whether the compact knowledge
   summary (`src/lib/llm/context.ts`) gives the model enough context to avoid re-asking settled
   questions — expect to tune `systemPrompt.ts` after watching it run.
2. No CI, no deployment target — both explicitly out of scope for v0.1 (`REQUIREMENTS.md`).
3. Once re-verified against a real model: consider whether `maxSteps: 5` in the chat route is
   enough headroom for a turn that both records a decision and updates two knowledge sections, or
   whether it needs raising.

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
