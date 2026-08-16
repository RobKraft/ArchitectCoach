# Working with AI on this project

The human-readable explanation of how AI collaboration works here, and what to expect from it.
The actual machine-read rules live in this project's `CLAUDE.md` and the root Dev Kit's
`claude.md`. Read those two for the literal instructions; read this one for the "why" and what it
means for you as a collaborator. See `apps/local-govt-reporter-ai/docs/ai-instructions.md` for a
filled-in real example.

## How it's configured

`CLAUDE.md` files are auto-loaded by Claude Code from the current directory up through its
parents. This project's own `CLAUDE.md` (repo root) holds current implementation status, the
locked-in decisions summary, and points at `ARCHITECTURE.md`, `REQUIREMENTS.md`, and this `docs/`
tree as required reading before making architectural changes; the Dev Kit root's `claude.md`
(`../../claude.md`) holds the standing clarify → propose → generate → integrate → test → document
workflow that applies across every app in this repo. **Keep `CLAUDE.md`'s "current status"
section accurate** — it's the first thing a new AI session in this repo reads, and a stale status
section actively misleads whoever (human or AI) reads it next.

## What to expect from AI-authored work here

- **Commits are co-authored**, not anonymous — every commit made with AI assistance should carry
  a co-author trailer, so `git log` makes clear which commits had AI involvement.
- **Claims are backed by verification, not just plausible-looking code.** A change touching a
  real external system should be run against real data before being called done — see
  `testing-standards.md`'s "Live smoke tests." Expect this discipline, and push back if it's
  missing.
- **Non-obvious decisions get an ADR**, not just an explanation that evaporates once the
  conversation is gone. Check `decisions/` before asking "why is this built this way" — the
  answer, and the rejected alternatives, are probably already written down.
- **Ambiguous or consequential choices get asked about, not guessed.** If a decision has real
  tradeoffs and no single obviously-correct answer, expect to be asked rather than have a default
  picked silently.
- **Risky or irreversible actions are confirmed first.** Installing system-level tools, spending
  real money, force-pushing, destructive git operations — expect to be asked, not surprised.

## What this means for you as a collaborator

- You can drive AI work yourself the same way — the same `CLAUDE.md` and practices docs apply
  regardless of who's typing.
- You can also just write code by hand. These standards aren't "AI's rules" — they're the
  project's rules, and they apply identically to human-written and AI-written code. Nothing in
  the repo should read differently depending on who wrote it.
- When you review a PR that had AI involvement, the PR template's "AI conversation" field is
  where the relevant reasoning/context should be linked or summarized, so you can review the
  *why*, not just the diff. If that field is empty on an AI-assisted PR, ask for it.
- If an AI session's proposed approach seems wrong, correct it the same way you'd correct a
  teammate — say what's wrong and why. That feedback is meant to stick for future sessions, not
  just the current conversation.
