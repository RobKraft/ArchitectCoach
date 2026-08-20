# ADR-0006: Pre-call moderation gate for interview chat messages

**Status:** Accepted
**Date:** 2026-08-20

## Context

`INTERVIEW_SYSTEM_PROMPT` was the only thing shaping what the coaching model would engage with —
not enforced, not logged, and it didn't stop tokens being spent: an off-topic or unsafe message
still ran the full coaching call (system prompt, tool definitions, knowledge summary, history)
before the model got a chance to decline. The product owner wants the API key protected from being
used for non-software questions, and wants explicit safeguards against hacking-for-harm, violence,
and sexual content requests, beyond what the underlying provider's own safety behavior already
does.

## Decision

Every incoming chat message is classified by `classifyMessage` (`src/lib/llm/moderation.ts`)
*before* the coaching model or any tool runs. It's a single `generateObject` call against a small,
separately-configured model (`getGateModel()` in `src/lib/llm/provider.ts` —
`ANTHROPIC_GATE_MODEL`/`OPENAI_GATE_MODEL`, defaulting to Haiku/`gpt-4o-mini`), returning
`{ onTopic, safe, reason }`. If either check fails, the route
(`src/app/api/projects/[id]/chat/route.ts`) returns a canned refusal directly — the coaching model
never runs, no tool calls happen. Both the blocked user message and the refusal are persisted to
`Message` with a new `blocked` flag (+ `blockReason` on the user row) for audit, and
`loadRecentHistory` (`src/lib/llm/context.ts`) excludes blocked rows so a rejected message is never
replayed back into the model's own context on a later turn. `INTERVIEW_SYSTEM_PROMPT` also
restates the same policy as defense-in-depth, in case something ambiguous slips past the gate
(e.g. a mostly-on-topic message with one harmful clause).

The gate fails **closed**: if the classification call itself errors (provider outage, network
failure), the message is blocked rather than let through.

## Alternatives considered

- **System prompt only, no gate**: rejected — doesn't stop token spend (the full coaching call
  still runs), and a system prompt alone is more easily talked around than a hard server-side
  branch that never invokes the model at all for a rejected message.
- **Keyword/regex blocklist**: rejected — free, but brittle. This app's whole subject matter
  includes security architecture (SQL injection, auth design, threat modeling), so a naive keyword
  filter would false-positive on exactly the legitimate questions the product exists to answer, and
  is trivially bypassed by rephrasing.
- **Fail-open on classifier error**: rejected in favor of fail-closed — an available-but-wrong gate
  is worse than an unavailable one for a tool whose whole point is guarding token spend and scope.
  Since the gate and the coaching model usually share a provider, an outage blocking the gate would
  likely have blocked the coaching call anyway.

## Consequences

- Every legitimate message now costs one extra small-model call (a few hundred ms, a small fraction
  of a cent) before the coaching turn starts. Acceptable given the stated goal is protecting spend
  overall.
- Two provider API surfaces are now in play per turn (gate model + coaching model) instead of one —
  slightly more that can fail, mitigated by the fail-closed behavior above rather than silently
  degrading.
- The gate's classification is itself a model call and can misclassify — no gate is perfect. The
  system-prompt reinforcement is the deliberate second layer for that gap, not a redundant one.
- `Message.blocked`/`blockReason` are new schema fields (see `prisma/schema.prisma`) — anything
  reading `Message` rows directly (not through `loadRecentHistory`) should be aware blocked rows
  now exist in the table.
