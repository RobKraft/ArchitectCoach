# Project documentation

Start here if you're new to this repo. Suggested reading order:

1. [`../ARCHITECTURE.md`](../ARCHITECTURE.md) — what's actually built: the interview engine, the
   knowledge model, pages, data flow, what's missing.
2. [`../REQUIREMENTS.md`](../REQUIREMENTS.md) — what this product is for and its v0.1 scope.
3. [`decisions/`](decisions/) — ADRs: the individual decisions that shaped the current
   implementation, with context, alternatives considered, and consequences.
4. [`../STATUS.md`](../STATUS.md) — what's confirmed working today and the immediate next step.

Then, as needed:

| Doc | Use it when |
|---|---|
| [`coding-standards.md`](coding-standards.md) | Writing or reviewing code in this repo |
| [`testing-standards.md`](testing-standards.md) | Writing or reviewing tests |
| [`security-checklist.md`](security-checklist.md) | Touching secrets, auth, or anything network-exposed |
| [`definition-of-done.md`](definition-of-done.md) | Deciding if a change is actually finished |
| [`review-checklist.md`](review-checklist.md) | Reviewing someone else's (or AI's) PR |
| [`ai-collaboration.md`](ai-collaboration.md) | Understanding how AI collaboration works here |
| [`local-setup-checklist.md`](local-setup-checklist.md) | Setting up this project on a fresh machine |
| [`architecture-doc-guide.md`](architecture-doc-guide.md) | Updating `ARCHITECTURE.md` after a structural change |

`../CLAUDE.md` holds the current implementation status and locked-in decisions in the compact form
an AI session reads first — this `docs/` tree is the fuller, human-oriented version of the same
picture. Keep both in sync.
