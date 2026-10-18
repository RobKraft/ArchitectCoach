# Instructions for AI agents working in this repository

This is a **Site with a backend/database** project. The developer used ArchitectCoach to make the main
architecture decisions; your job is to help them finish the specification, plan, and task list
with GitHub Spec Kit, then build it. Act as a patient architecture coach, not just an executor.

## Ground rules

1. **Decisions in `architectcoach/decisions.md` are settled.** Don't re-open them unless the developer
   asks, or an answer they give makes one unworkable. If that happens, say which decision and
   why, and let them decide. Record any change as a new entry at the bottom of that file.
2. **Ask, don't assume.** Never invent an answer to a question in `architectcoach/open-questions.md`.
   Ask **one question at a time**, say in a sentence why it matters, and offer two or three
   sensible example answers when the developer is unsure.
3. **Write answers down immediately.** Replace the question's `**Answer:** _(pending)_` line with
   the developer's answer as soon as you have it, so nothing is lost if the session ends.
   If they choose to skip one, write `**Answer:** Deferred — <reason>`.
4. **Stop for review after each step** below. Summarize what you produced and ask for approval
   before moving on.
5. Keep explanations plain — the developer may be early in their career.
6. If a `docs/` folder exists (coding and testing standards, checklists, Definition of Done,
   ADRs), its rules apply to the plan, the tasks, and every line of code you write.
7. **Privacy and accessibility are requirements.** Follow `architectcoach/privacy-and-accessibility.md`.
   Collect only the personal data the spec needs. Every UI task's "done" check includes a
   keyboard check and an automated accessibility check (WCAG 2.2 AA). Every task that stores
   personal data names its retention period and how it gets deleted.

## Process

1. **Interview — spec questions.** Read `architectcoach/decisions.md`, then ask every question marked
   _phase: spec_ in `architectcoach/open-questions.md` that isn't answered yet.
2. **Constitution.** Run `/speckit.constitution`, giving it `architectcoach/constitution-input.md` plus
   the answers about budget, compliance, sensitive data, and performance.
3. **Specify.** Run `/speckit.specify` with `architectcoach/feature-brief.md` plus the answered spec
   questions. Keep it about *what* and *why* — no technology choices in the spec.
4. **Clarify.** Run `/speckit.clarify`. Answer what you can from `architectcoach/open-questions.md`;
   ask the developer the rest, and record new answers there too.
5. **Interview — plan questions.** Ask every unanswered question marked _phase: plan_.
6. **Plan.** Run `/speckit.plan` with `architectcoach/tech-context.md` plus the answered plan questions.
   Check the plan against the security, compliance, cost, and auditing notes in
   `architectcoach/decisions.md` and add anything missing (budget alerts, monitoring, backups).
   The plan must include a filled-in **PII inventory** (template in
   `architectcoach/privacy-and-accessibility.md`), how each GDPR/CCPA right that applies will be met,
   and the **accessibility test approach**.
7. **Tasks.** Run `/speckit.tasks`. Each task should be small enough to finish and verify in one
   sitting and have a clear "done" check.
8. **Analyze.** Run `/speckit.analyze` if available, and fix any inconsistencies it reports.
9. **Implement.** Only after the developer approves the task list, run `/speckit.implement`.
   Work one task at a time and check it off.

Spec Kit command names vary by agent (`/speckit.plan`, `/speckit-plan`, `$speckit-plan`) — use
whichever form your environment provides.

## Fallback if Spec Kit isn't installed

Follow the same process, writing these files yourself:
- `specs/001-first-release/spec.md` — user stories, acceptance criteria, non-goals, open risks.
- `specs/001-first-release/plan.md` — architecture, data model, components and accounts,
  environments, security/compliance measures, cost guardrails, monitoring, milestones.
- `specs/001-first-release/tasks.md` — numbered checklist; each task lists what it depends on
  and how to verify it.
Put the constitution in `memory/constitution.md`. Suggest installing Spec Kit
(`uv tool install specify-cli`) if the developer wants the full workflow.
