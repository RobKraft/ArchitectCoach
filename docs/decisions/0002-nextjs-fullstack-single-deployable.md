# ADR-0002: Next.js full-stack (App Router), not a separate ASP.NET Core or FastAPI backend

**Status:** Accepted
**Date:** 2026-08-15

## Context

Three stack options were on the table for the v0.1 prototype: Next.js + a separate ASP.NET Core
API, Next.js + a separate Python/FastAPI API (matching the precedent in
`apps/local-govt-reporter-ai`), or Next.js full-stack using its own API routes. The deciding
question was hosting: is a split frontend+backend meaningfully harder to host than a single
Next.js deployable?

The answer: ASP.NET Core and FastAPI aren't hard to host on their own (both run fine as Linux
containers on Render, Railway, Fly.io, Azure App Service, Cloud Run) — but neither gets the
zero-config path Vercel offers Next.js, and a split setup always means **two services** to deploy,
configure, and keep talking to each other (CORS, shared env config, two build pipelines), on any
host. For a prototype whose entire purpose is finding out if the core UX idea works — and that
may well be thrown away — that's overhead with no corresponding benefit yet.

## Decision

Next.js 14 (App Router, TypeScript), full-stack: React Server Components read from Postgres
directly, and `src/app/api/**/route.ts` handlers cover everything else (create project, the
streaming interview turn, plan generation). One deployable, one language, one `git push` away from
Vercel or any Node host.

## Alternatives considered

- **Next.js + ASP.NET Core API**: stronger typing/tooling on the backend, and a natural fit if
  this ever needs to become a larger enterprise-style backend — but two services to host and wire
  together, for no gain at prototype stage.
- **Next.js + Python/FastAPI API**: matches this repo's existing precedent
  (`apps/local-govt-reporter-ai`) — same two-service hosting cost as the ASP.NET option, with the
  added friction of two languages (TypeScript frontend, Python backend) in one small app.

## Consequences

- Simplest possible hosting story for a prototype: no CORS configuration, no second build/deploy
  pipeline, no cross-service env var duplication.
- Server Components query Prisma directly rather than going through a formal API/service layer —
  acceptable at this size (see `docs/coding-standards.md`'s repository-layout note), but would
  need a real service layer if this grows past a single small app.
- If a genuinely separate backend becomes necessary later (a mobile client, a public API, a
  language-specific need), it's a new project talking to the same Postgres database, not a
  rewrite of this one — the knowledge model (ADR-0001) is intentionally backend-agnostic.
