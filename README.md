# ArchitectCoach

## Overview

ArchitectCoach is an AI architectural coach for software developers — not a code generator. A
developer describes what they're building; the app interviews them one focused question at a
time, explains why each question matters, and turns the conversation into structured, persistent
project knowledge (requirements, architecture, technology) instead of just saving a transcript.
Significant choices are recorded as Decision Records — what was decided, why, what alternatives
were considered, the tradeoffs, the consequences — so six months later "why did we do it this
way?" has a real answer. See `REQUIREMENTS.md` for the full v0.1 scope and `ARCHITECTURE.md` for
the component breakdown, data model, and the reasoning behind the stack/hosting/LLM-provider
choices (also in `docs/decisions/`). **See `STATUS.md` for what's built and verified vs. what's
still open.**

This is v0.1: single developer, local-only, no auth, no payments — deliberately, see
`REQUIREMENTS.md`'s "out of scope" list and the source design conversation it comes from.

## Stack

Next.js 14 (App Router, TypeScript) full-stack, Postgres via Prisma, Tailwind CSS, Vitest.
LLM access is provider-agnostic (Anthropic or OpenAI) via the Vercel AI SDK — see
`docs/decisions/0003-provider-agnostic-llm-via-vercel-ai-sdk.md`.

## Installation

Requires Node.js 20+, Docker Desktop, and an Anthropic or OpenAI API key. Full walkthrough in
`docs/local-setup-checklist.md`; short version:

```bash
cd apps/ArchitectCoach
docker compose up -d              # starts Postgres
npm install
npx prisma migrate dev            # creates the schema
cp .env.example .env.local        # then edit: set LLM_PROVIDER and the matching API key
```

## Running locally

```bash
npm run dev
```

Open `http://localhost:3001` (not 3000 — this machine already has something else bound to 3000;
see `npm run dev`'s `-p 3001` in `package.json`), start a project, and go through the interview. The project list,
Requirements/Architecture/Technology/Decisions pages, and schema all work without an API key —
only the Interview and Development Plan pages call the LLM.

## Testing

```bash
npm test
```

Vitest. Most tests are pure unit tests (knowledge schema validation, context-assembly, the
plan-generation prompt builder). One integration test writes to a real local Postgres (via
`buildInterviewTools`) — it needs `docker compose up -d` running, and skips with a clear message
if Postgres isn't reachable. See `docs/testing-standards.md`.
