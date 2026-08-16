# ADR-0001: Project knowledge stored as a typed JSON document, not a fully normalized schema

**Status:** Accepted
**Date:** 2026-08-15

## Context

The core product idea (from the source design conversation) is that the AI interview should
populate **structured project knowledge**, not just save a raw chat transcript — that's what lets
the app render persistent pages, show progress, and reason about state, instead of re-summarizing
a conversation every time. The question is how "structured" gets implemented in Postgres: a fully
normalized relational schema (a table per nested list — functional requirements, components,
milestones, ...), or a single typed JSON document per project.

This is v0.1, whose whole purpose is to find out whether the interview experience is any good.
The shape of `ProjectKnowledge` (what fields requirements/architecture/technology actually need)
is expected to change repeatedly as that gets figured out.

## Decision

`Project.knowledge` is one JSONB column holding a Zod/TypeScript-typed `ProjectKnowledge` document
(`src/lib/knowledge/types.ts`): `requirements`, `architecture`, `technology`, `developmentPlan`,
each with a fixed set of fields (strings and string arrays). `DecisionRecord` and `Message`, which
have a stable shape and are queried/joined independently, remain real relational tables.

## Alternatives considered

- **Fully normalized schema** (a `Requirement` table, a `Component` table, etc.): the "textbook
  correct" structured-data approach, and closer to what a mature version of this product would
  need for real cross-decision reasoning. Rejected for v0.1: every new field means a migration,
  and the fields themselves aren't settled yet.
- **Raw conversation transcript as the source of truth**: rejected outright — this is the exact
  thing the source conversation identifies as the weaker competing approach ("conversation =
  100,000 tokens" vs. a model the AI can reason over).

## Consequences

- Reading/rendering a section is a plain object property access, not a join — the
  Requirements/Architecture/Technology pages are simple.
- The "does this decision affect other decisions" reasoning envisioned for a later stage (Stage
  2/3 in the source conversation) will be harder to build against a loosely-typed JSON blob than
  against normalized rows with real foreign keys — this is a deliberate cost being deferred, not
  avoided.
- No per-field query capability (e.g. "find all projects using PostgreSQL") — would require a
  JSONB query or a future migration to pull `technology.database` into its own indexed column.
- If v0.1 proves the concept, migrating `ProjectKnowledge`'s settled fields into real tables is
  the expected next step, not a rewrite — the Zod schema already documents the shape that would
  become the migration's target.
