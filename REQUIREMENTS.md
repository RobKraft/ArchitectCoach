# Requirements: ArchitectCoach

## What this is

An AI architectural coach for software developers. It is **not** a code generator and not an
"tell it what you want and it builds the app" tool. It interviews a developer about what they're
building, turns the conversation into structured, persistent project knowledge (not a saved chat
transcript), renders that knowledge as pages the developer can leave and return to days later,
records significant choices as Decision Records (why, alternatives, tradeoffs, consequences), and
explains *why* it's asking each question so the developer gets better at architecture along the
way. Full origin and philosophy: the ChatGPT design conversation this project is built from
(summarized in `ARCHITECTURE.md`'s context and in the ADRs).

## v0.1 scope (this build)

### In scope
- Create a project (name + optional one-line purpose).
- AI interview: conversational, tool-calling driven, populates structured project knowledge
  (requirements, architecture, technology) rather than just logging a transcript.
- Persistent pages per project: Overview (progress dashboard), Requirements, Architecture,
  Technology, Decision Records (list + detail), Development Plan.
- Decision Records: title, section, decision, rationale ("why"), alternatives considered,
  tradeoffs, consequences, and 1-3 "learn more" topics — the educational layer.
- AI-generated development plan (milestones, tasks, dependencies, recommended order), generated
  on demand from the accumulated knowledge + decisions.
- Save/resume: closing the browser and coming back later resumes exactly where the developer left
  off, because state lives in Postgres, not client memory or an in-flight conversation.
- Provider-agnostic LLM access (Anthropic or OpenAI, chosen by `LLM_PROVIDER`).

### Explicitly out of scope for v0.1
Deferred to a later stage, per the source conversation's own staging (auth/payments/teams don't
matter until the core experience is proven useful):
- Authentication, user accounts, multi-user isolation (today: single implicit user, every project
  is globally visible to whoever can reach the app).
- Payments/billing.
- Cross-project learning ("you've built several .NET apps before...").
- Generating a context package for an external AI coding agent (Claude Code, Cursor, Copilot,
  etc.) to consume.
- Change-impact analysis ("changing X affects these N other decisions").
- Any deployment/hosting decision beyond local development.

## Scope changes since v0.1 was written

> **Conflict flagged:** this document still describes an AI-driven interview. The product has since
> moved to a static, click-only wizard for all 5 built-in project types (see `STATUS.md`), so
> functional requirements 2 and 7 below now apply only to the fallback chat path.

- **Option assessments (added 2026-10-17, [ADR-0007](docs/decisions/0007-precomputed-option-assessments.md)).**
  For every option on an architecture/technology step, the wizard answers, without any AI call:
  How complicated is deployment? Which accounts and integrations must be managed? Ballpark monthly
  cost (Free / ~$1 / ~$10 / ~$50 / ~$100 / $100+)? Security concerns? How scalable? Governance,
  risk & compliance concerns? How to audit for correctness? How to stay on top of costs? What
  performance to expect?
  - *Acceptance:* every assessed option shows all nine answers in a "Deep dive", each step shows
    a side-by-side comparison table, and the test suite fails if any option is missing an answer.
  - *Not yet:* answers don't combine across choices or adapt to the developer's earlier answers,
    and aren't copied into Decision Records.
- **Spec Kit download (added 2026-10-17, [ADR-0008](docs/decisions/0008-spec-kit-compatible-download.md)).**
  After finishing the wizard, any of the 5 project types can download a GitHub Spec Kit–compatible
  kit: decisions with assessments, open questions (spec/plan phase) for the developer's own AI
  agent to ask, inputs for each `/speckit.*` command, and `AGENTS.md` instructions to produce the
  spec, plan, and task breakdown and then build. No AI runs on this site to produce it.
  - *Acceptance:* the ZIP contains every kit file for all 5 types, includes only the picked
    options' follow-up questions, and writes nothing to `.specify/` or `specs/`
    (`tests/specKit.test.ts`).
  - Every kit includes `privacy-and-accessibility.md` (PII inventory, GDPR/CCPA, WCAG 2.2 AA per
    platform, ADA/EAA context), and its constitution always makes privacy by design and
    accessible-by-default binding (added 2026-10-18).

## Functional requirements

1. A developer can create a new project and immediately start an interview.
2. The interview asks one focused question at a time, explains why it matters, and accepts free
   text (not a rigid multiple-choice wizard).
3. As the developer answers, the system updates structured project knowledge live — visiting
   Requirements/Architecture/Technology mid-interview shows real, current content, not a
   placeholder.
4. Significant decisions are recorded as Decision Records automatically during the interview, not
   only on request.
5. A developer can leave at any point and resume later with full context preserved — no
   information is lost, and the AI doesn't re-ask what's already answered.
6. A developer can generate (and regenerate) an AI-written development plan once enough project
   knowledge exists.
7. Switching `LLM_PROVIDER` between `anthropic` and `openai` changes which model answers, with no
   other code change required.

## Non-functional requirements

- **Cost control**: the model must not be re-sent the full conversation transcript every turn — it
  reasons from a compact structured-knowledge summary plus a bounded window of recent messages
  (see `src/lib/llm/context.ts`, `MAX_HISTORY_MESSAGES`).
- **Resumability**: all state that defines "where the project stands" lives in Postgres, not in
  client-side or in-memory state, so a browser refresh or a return visit days later loses nothing.
- **Honesty over completeness in Decision Records**: every recorded decision must include real
  tradeoffs/consequences, not just benefits — enforced by the system prompt, not by code.

## Constraints

- Single developer, local-only deployment target for v0.1 (see ADR-0004). No production hosting
  decision has been made.
- No auth — do not treat this as safe to expose beyond `localhost` (see
  `docs/security-checklist.md`).

## Acceptance criteria for "v0.1 is done"

- A developer can go from "I have an idea" through a real interview to seeing populated
  Requirements/Architecture/Technology pages, at least one real Decision Record, and a generated
  development plan, entirely through the running app.
- Closing the browser mid-interview and reopening the same project resumes correctly.
- The above works against either LLM provider by only changing `.env.local`.
