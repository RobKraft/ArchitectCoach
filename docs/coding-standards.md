# Coding standards

## Language and tooling

- Language/runtime: Node 20+, TypeScript, Next.js 14 (App Router).
- Linter/formatter: ESLint (`next/core-web-vitals` config, see `.eslintrc.json`) — run `npm run
  lint` before considering anything done (see `definition-of-done.md`). No Prettier configured yet
  — a known gap, not a deliberate choice.
- Type checker: TypeScript in `strict` mode (`tsconfig.json`), enforced by `next build` and
  `tsc --noEmit`. No CI pipeline exists yet for this prototype, so it's currently enforced by
  convention/local build, not automatically on every push.
- Test runner: Vitest (`npm test`) — plain `describe`/`it` functions, no heavyweight fixtures.

## Comments and docstrings

- **Module/file-level docs are the primary documentation.** Every source file should open with a
  short statement of its purpose, and — if the project has a design doc — which part of it this
  file implements.
- **Default to no inline comments.** Only write one when the *why* is genuinely non-obvious: a
  hidden constraint, a workaround for a specific bug, a fact a reader can't derive by reading the
  line itself. Never write a comment that just restates what the code already says.
- Function/method docs: one line when the name doesn't already say what it does; skip them
  entirely when they'd just restate the signature.

## Types and data modeling

- Zod validates every boundary: the `ProjectKnowledge` model persisted in Postgres
  (`src/lib/knowledge/types.ts`), every interview tool-call input the LLM produces
  (`src/lib/llm/interviewTools.ts`), and API request bodies. Prisma-generated types cover
  everything read back out of the database.
- Use closed-vocabulary types (enums, string literal unions, sum types) for closed sets of values
  instead of bare strings, even if the storage layer ends up persisting them as plain strings.
- Type-hint/annotate everything public, in whatever form your language supports.

## Testability: dependency injection over monkeypatching internals

Every piece of code that talks to an external system (HTTP API, database client, third-party SDK)
should accept that dependency as an optional constructor/function argument, defaulting to the
real thing:

```
class Thing:
    def __init__(self, ..., http_client=None):
        self._client = http_client or RealHttpClient()
```

This is what lets tests inject a fake/mock client instead of hitting the network, without
monkeypatching module internals. **Apply this to any new external dependency** — see
`testing-standards.md` for how the tests then use it.

## Lazy-load optional/heavy dependencies

If a dependency is only needed for one code path that not every user of the module will exercise
(an optional feature, a heavy library), import/load it inside the function that needs it, not at
module load time. Keeps the base install light and means code that never hits the optional path
never pays for a dependency that isn't installed.

## Errors: name the failure, don't swallow it

When something can fail in an anticipated way, raise/return an error that names what's wrong and
how to fix it. Don't return `null`/`None`/an empty result to silently mean "this failed" — that's
indistinguishable from "there was genuinely nothing to find."

Don't add error handling or fallback branches for scenarios that can't happen. Validate only at
real system boundaries (external APIs, file/network I/O, user input) — trust internal contracts.

## Configuration

Env-driven, read via `process.env` in exactly two places: `src/lib/llm/provider.ts` (`LLM_PROVIDER`,
`ANTHROPIC_MODEL`/`OPENAI_MODEL`, and the two API keys, all resolved through the SDK client
constructors) and `prisma/schema.prisma`'s `DATABASE_URL`. No other file reads `process.env`
directly — see `.env.example` for the full list of settings the app uses.

## Repository layout

- `src/app/**/page.tsx` (Server Components) read directly from Postgres via `src/lib/db.ts`'s
  Prisma singleton — there's no separate read-side service layer for a prototype this size.
- All **writes during the interview** go through `src/lib/llm/interviewTools.ts` — the LLM is the
  only thing that calls these, and they're the only place that mutates `Project.knowledge` or
  creates a `DecisionRecord`. A page/route should never patch `knowledge` directly.
- `src/app/api/**/route.ts` handles the remaining mutations that don't come from the model:
  creating a project, and generating the development plan (`src/lib/llm/planPrompt.ts` +
  `generateText`, one-shot, no tools).
- `src/lib/llm/provider.ts` is the only file that imports `@ai-sdk/anthropic` or
  `@ai-sdk/openai` directly — see
  `docs/decisions/0003-provider-agnostic-llm-via-vercel-ai-sdk.md`.
