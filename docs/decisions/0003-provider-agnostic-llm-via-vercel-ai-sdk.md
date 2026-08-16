# ADR-0003: Provider-agnostic LLM access via the Vercel AI SDK, from day one

**Status:** Accepted
**Date:** 2026-08-15

## Context

Unlike the stack and hosting question, this was a deliberate choice made explicit up front: the
interview/coaching engine should be able to run against either Anthropic or OpenAI, chosen by
config rather than hardcoded to one SDK. Vendor lock-in risk and a desire to compare provider
behavior for this specific "ask one good question, explain why, call tools to record structured
decisions" use case both motivated this over the simpler "just call Anthropic's SDK directly"
default.

## Decision

All model access goes through the `ai` package (Vercel AI SDK) with `@ai-sdk/anthropic` and
`@ai-sdk/openai` as swappable model providers. `src/lib/llm/provider.ts` is the only file that
imports either provider package directly; it picks one based on the `LLM_PROVIDER` env var
(`"anthropic"` | `"openai"`). Everything else — the system prompt, the interview tools
(`src/lib/llm/interviewTools.ts`), the streaming chat route, the plan-generation route — is
written against the `ai` SDK's provider-agnostic `LanguageModel` type and its unified
`streamText`/`generateText`/`tool()` APIs, so switching providers never touches interview logic.

## Alternatives considered

- **Anthropic SDK directly**: simpler, one less abstraction layer — but locks the whole app to one
  provider's API shape, contradicting the explicit "provider-agnostic from day one" requirement.
- **Hand-rolled abstraction over both providers' native SDKs**: full control, but reimplements
  what the `ai` SDK already provides (unified streaming, unified tool-calling/function-calling
  across providers with different native tool-call formats) — not worth building for a prototype.

## Consequences

- Tool-calling behavior (how reliably each provider calls tools, how it phrases explanations)
  will differ between Anthropic and OpenAI even through the same abstraction — the system prompt
  (`src/lib/llm/systemPrompt.ts`) may need provider-specific tuning later if behavior diverges
  noticeably; none has been added yet.
- The chat route uses `toTextStreamResponse()` (plain streamed text) rather than the `ai` SDK's
  richer "data stream" protocol, specifically so the client doesn't depend on a stream-protocol
  version that could differ across `ai` SDK releases — tool calls are resolved and persisted
  server-side before any text streams, so the client only ever needs the assistant's visible
  reply text.
- Pinned to whatever model IDs are set in `.env` (`ANTHROPIC_MODEL`/`OPENAI_MODEL`, defaulted in
  `provider.ts`) — no automatic fallback if a configured model is retired or renamed.
