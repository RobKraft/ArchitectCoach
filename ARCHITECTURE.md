# Architecture: ArchitectCoach

## Overview

ArchitectCoach is a single Next.js 14 (App Router, TypeScript) application — no separate backend
service (see [ADR-0002](docs/decisions/0002-nextjs-fullstack-single-deployable.md)). React Server
Components read directly from Postgres via Prisma; API routes under `src/app/api/` handle writes
that don't originate from the LLM. Postgres runs in Docker locally
([ADR-0004](docs/decisions/0004-docker-compose-postgres-only.md)); the app itself runs on the host
via `npm run dev`. There is no deployed environment yet — this describes local dev only.

```
Browser
  │
  │  Server Components (read Prisma directly)
  ▼
Next.js app (src/app/)
  │
  ├── page.tsx, projects/[id]/**/page.tsx ──────► Postgres (via src/lib/db.ts, Prisma)
  │
  ├── api/projects/route.ts (create/list)
  ├── api/projects/[id]/route.ts (read)
  ├── api/projects/[id]/plan/route.ts ──────────► generateText() ──► LLM provider
  │
  └── api/projects/[id]/chat/route.ts
         │
         │  streamText({ tools: buildInterviewTools(projectId), maxSteps: 5 })
         ▼
      classifyMessage() ──► gate model (small/cheap, via getGateModel())
         │  blocked? short-circuit with a canned refusal, no coaching call
         ▼
      LLM provider (Anthropic or OpenAI, via src/lib/llm/provider.ts)
         │
         │  tool calls: update_requirements / update_architecture / update_technology /
         │              record_decision / set_interview_progress
         ▼
      src/lib/llm/interviewTools.ts ──writes──► Postgres (Project.knowledge, DecisionRecord)
```

## The core data model

`Project.knowledge` (JSONB) holds the structured **project knowledge model** — this is the
central design decision of the whole app (see
[ADR-0001](docs/decisions/0001-jsonb-knowledge-model-not-full-normalization.md)): the interview
populates *this*, not a saved transcript.

```
ProjectKnowledge (src/lib/knowledge/types.ts)
  requirements       { purpose, users[], goals[], nonGoals[], functionalRequirements[] }
  architecture       { style, components[], dataFlow, notes }
  technology         { frontend, backend, database, hosting, authentication, thirdPartyServices[] }
  developmentPlan    { markdown, generatedAt }
```

`Project.interviewState` (JSONB) tracks `{ currentTopic, completedTopics[] }` — what the interview
has already covered, so it doesn't re-ask.

`DecisionRecord` is a real relational table (one row per decision, `number` sequential per
project): `title`, `section`, `decision`, `rationale`, `alternatives`, `tradeoffs`,
`consequences`, `learnMore[]`. This is the "Teacher" layer from the source design conversation —
every decision explains itself.

`Message` stores the raw chat transcript (`role`, `content`) purely for display in the Interview
page's chat UI. **It is not what gets sent back to the model** — see below.

## Layering rule

**All writes during the interview go through `src/lib/llm/interviewTools.ts`.** The LLM is the
only caller of these functions; no page or route patches `Project.knowledge` or creates a
`DecisionRecord` directly. This keeps "how project knowledge changes" in one place, auditable by
reading one file, regardless of which provider is answering.

## End-to-end walkthrough: one interview turn

1. Developer types a message in `ChatPanel` (`src/components/ChatPanel.tsx`) and it `POST`s
   `{ message }` to `/api/projects/[id]/chat`.
2. The route (`src/app/api/projects/[id]/chat/route.ts`) runs the message through
   `classifyMessage()` (`src/lib/llm/moderation.ts`) — a pre-call gate against a small, separately
   configured model (see [ADR-0006](docs/decisions/0006-pre-call-moderation-gate.md)) checking
   whether the message is on-topic for software development and safe. If either check fails, the
   route persists the message and a canned refusal (both flagged `blocked: true` on `Message`) and
   returns the refusal directly — the coaching model and tools never run for that turn.
3. Otherwise, the route saves the user message to `Message`, then loads the current
   `ProjectKnowledge`/`InterviewState` and the last `MAX_HISTORY_MESSAGES` (10) messages — **not
   the full transcript**, and never any `blocked` rows (`src/lib/llm/context.ts`). This is the
   app's cost control: the model reasons from a compact rendered summary of current state
   (`summarizeKnowledge()`) plus a bounded recent window, never the whole conversation.
4. `streamText()` runs with `INTERVIEW_SYSTEM_PROMPT` (the "architectural coach" persona,
   `src/lib/llm/systemPrompt.ts`, which also restates the moderation policy as defense-in-depth)
   and the five interview tools available. The model can call tools across up to 5 steps
   (`maxSteps: 5`) before producing its final reply.
5. Each tool call executes immediately server-side against Postgres — e.g. `update_architecture`
   merges its patch into `Project.knowledge.architecture` (arrays are unioned, not overwritten, so
   repeated small updates accumulate); `record_decision` creates a new `DecisionRecord` with the
   next sequential `number` for that project.
6. The route streams the model's final text back to the browser as **plain text**
   (`toTextStreamResponse()`, not the `ai` SDK's richer data-stream protocol — see
   [ADR-0003](docs/decisions/0003-provider-agnostic-llm-via-vercel-ai-sdk.md) for why), appended
   live into the chat bubble and rendered as markdown client-side (`ReactMarkdown`, same pattern as
   `PlanPanel.tsx`).
7. `onFinish` persists the assistant's full text as a `Message` row. The client calls
   `router.refresh()` once streaming ends, so the sidebar's progress ticks
   (`sectionCompletion()` in `src/lib/knowledge/types.ts`) and any other Server Component on the
   page reflect what the tool calls just wrote.

A developer can navigate straight to `/projects/[id]/requirements` (or any section page) at any
point in this flow and see live state — there's no separate "save" step.

## What's missing

- **No authentication** — every project is visible to anyone who can reach the app. Deliberately
  out of scope for v0.1 (see `docs/security-checklist.md`).
- **No deployment target decided** — this only runs locally today.
- **No CI** — lint/typecheck/test all run manually.
- **Change-impact reasoning** ("this affects N other decisions") does not exist — `DecisionRecord`
  has no relationships to other decisions yet, only to its project.
- **No AI-coding-agent context export** — the development plan is a page in the app, not yet
  packaged as something to hand to Claude Code/Cursor/Copilot.
- **Interview topic ordering is prompt-driven, not code-driven** — `currentTopic`/
  `completedTopics` are freeform strings the model sets via `set_interview_progress`, not a fixed
  enum with defined transitions. Works for v0.1; would need real structure if the interview logic
  needs to be inspected or tested independently of the model's behavior.

## Runtime topology

Local only: Postgres in Docker (`docker-compose.yml`), Next.js on the host (`npm run dev`), both
on `localhost`. See `docs/local-setup-checklist.md`.
