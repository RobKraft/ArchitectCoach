# ADR-0004: Local dev — Postgres in Docker Compose, the Next.js app runs on the host

**Status:** Accepted
**Date:** 2026-08-15

## Context

Local development needs a database. The app itself is a single Next.js process. Following the
same split already established in `apps/local-govt-reporter-ai`
([its ADR-0004](../../local-govt-reporter-ai/docs/decisions/0004-docker-compose-for-postgres-only.md)):
containerize only the piece that's genuinely infrastructure, run the actual application with the
normal `npm run dev` hot-reload workflow.

## Decision

`docker-compose.yml` defines exactly one service: Postgres 16. The Next.js app runs directly on
the host via `npm run dev`, connecting to the containerized Postgres over `localhost:5432`.

## Alternatives considered

- **Containerize the whole app** (a second service in the compose file, or a full docker-compose
  dev environment): loses Next.js's fast-refresh dev loop behind a container rebuild/restart cycle
  for no real benefit in local development.
- **No Docker at all, install Postgres natively**: avoids the Docker Desktop dependency, but is
  harder to reset/tear down cleanly and diverges from the pattern already established elsewhere
  in this repo.

## Consequences

- Requires Docker Desktop running locally (see `docs/local-setup-checklist.md`) purely for
  Postgres — a genuine prerequisite, not optional.
- `docker-compose.yml`'s Postgres credentials are placeholder local-dev values, explicitly never
  meant for a shared/deployed environment (see `docs/security-checklist.md`).
- Deployment topology (how Postgres and the app run together outside a developer's machine) is
  intentionally undecided — out of scope until this moves past prototype stage.
