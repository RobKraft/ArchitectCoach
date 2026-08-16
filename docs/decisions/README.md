# Architecture Decision Records

Each ADR captures one decision: the context that forced it, what was chosen, and what it costs.
Read them when wondering "why is this built this way" — the answer should be here, not buried in
a commit message or a chat conversation.

See `apps/local-govt-reporter-ai/docs/decisions/` for nine real, filled-in ADRs from an actual
project — a good reference for the level of concreteness to aim for (real context, real
alternatives that were genuinely considered, real costs admitted, not hedged generic tradeoffs).

## Format

New ADRs use `template.md`. Keep them short — a decision that needs three pages to justify is
usually a sign the decision itself is shaky. Number sequentially, never renumber or delete a
superseded one — mark it "Superseded by ADR-00XX" instead, so the history stays intact.

## Index

| # | Title | Status |
|---|---|---|
| [0001](0001-jsonb-knowledge-model-not-full-normalization.md) | Project knowledge as a typed JSON document, not a fully normalized schema | Accepted |
| [0002](0002-nextjs-fullstack-single-deployable.md) | Next.js full-stack, not a separate ASP.NET Core/FastAPI backend | Accepted |
| [0003](0003-provider-agnostic-llm-via-vercel-ai-sdk.md) | Provider-agnostic LLM access via the Vercel AI SDK | Accepted |
| [0004](0004-docker-compose-postgres-only.md) | Local dev: Postgres in Docker Compose, app runs on host | Accepted |
| [0005](0005-non-default-local-ports.md) | Non-default local ports (app 3001, Postgres 5433) | Accepted |
