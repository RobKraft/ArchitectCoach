# Writing an as-built architecture doc

Not a template to fill in blanks — a guide to what this doc should cover and why, since
architecture docs are more about judgment than boilerplate. See
`apps/local-govt-reporter-ai/docs/architecture.md` for a complete real example.

## What this doc is for, and what it isn't

If a design/vision doc already exists for the project (a proposal, an RFC, a "why we're building
this" doc), the as-built architecture doc is **different from it and should say so explicitly**:
the vision doc is the source of truth for *why* and *what's planned*; this doc is the source of
truth for *what's actually built right now*. They will drift apart over time — that's expected —
which is exactly why this doc needs to exist and stay current, rather than trusting the vision
doc to describe reality.

## What to include

- **A system diagram** (ASCII is fine — it stays readable in a terminal/diff, doesn't need a
  rendering tool) showing the real components and how data actually flows between them today —
  not the eventual full system.
- **The core data model** — whatever object/schema everything else revolves around. What fields
  exist, what each one means, and which ones are populated by which part of the system (this
  matters more than it sounds: a field that *looks* populated in the schema but is actually
  always empty because the code that fills it doesn't exist yet is a common, confusing trap).
- **A named layering rule**, if the codebase has one worth preserving — e.g. "ingestion never
  does extraction," "the API layer never talks to the database directly." Say the rule plainly
  and link the ADR that justifies it, so it's enforceable in review, not just a vibe.
- **An end-to-end walkthrough** of the real data flow, step by step, naming actual functions/
  modules — a reader should be able to follow one request/record through the whole system by
  reading this section alone.
- **A "what's missing" section, stated as plainly as what exists.** This is the section most
  architecture docs skip, and it's the one that prevents the most confusion. If there's no
  frontend, say "there is no frontend" in plain language, not just an absence from the diagram.
  If there's a structural gap (e.g. no orchestration layer tying two working pieces together
  yet), name it, so nobody assumes it exists because the two pieces it would connect both work.
- **Runtime topology** — what actually runs where today (local only? containerized? deployed?),
  not the eventual target topology.

## Keep it in sync

Treat a stale architecture doc as worse than no doc — it actively misleads. Update it in the same
PR/commit as any change to module structure or data flow (see `definition-of-done.md`).
