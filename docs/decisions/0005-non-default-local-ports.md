# ADR-0005: Non-default local ports — app on 3001, Postgres on 5433

**Status:** Accepted
**Date:** 2026-08-15

## Context

Verifying the build locally (`docker compose up -d`, `npm run dev`) failed on this machine: port
5432 was already bound by `local-govt-reporter-ai-db` (another app in this same `apps/` monorepo,
already running), and port 3000 was already bound by an unrelated running service
(`open-webui`, in this environment). Both are genuine environmental conflicts on this dev machine,
not a reason to redesign anything.

## Decision

`docker-compose.yml` binds Postgres to host port **5433** (container's internal 5432 is
unchanged). `package.json`'s `dev`/`start` scripts run Next.js on port **3001**
(`next dev -p 3001` / `next start -p 3001`). `.env.example`'s `DATABASE_URL` and all docs
(`README.md`, `STATUS.md`, `docs/local-setup-checklist.md`) reference these ports directly.

## Alternatives considered

- **Stop the conflicting services and keep the defaults**: rejected — `local-govt-reporter-ai`'s
  database is another project's active infrastructure; stopping it to free 5432 isn't this
  project's call to make.
- **Leave the defaults and let `docker compose up`/`npm run dev` fail with instructions to resolve
  port conflicts manually**: rejected as unnecessary friction — a fixed non-conflicting port pair
  costs nothing and just works.

## Consequences

- These ports are specific to *this developer's current machine state*, not a general property of
  the app. On a clean machine (or once the conflicting services are gone), 3000/5432 would work
  fine too — nothing here is load-bearing beyond "don't collide with what's already running."
  Revisit if this ever moves to a machine without these conflicts, or just leave it — 3001/5433
  work everywhere the defaults would.
- Anyone running multiple apps from this `apps/` monorepo locally at once should expect to check
  for port collisions the same way — there's no shared port registry across apps yet.
