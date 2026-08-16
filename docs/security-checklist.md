# Security checklist

Fill this in with what's actually sensitive in *this* project — a generic OWASP-style checklist
where most items don't apply is worse than a short, accurate one, because the parts that do apply
get lost in the noise. See `apps/local-govt-reporter-ai/docs/security.md` for a real example
(a project whose main asset is already-public data, which shapes its posture a lot).

## 1. Data sensitivity posture — establish this first

v0.1 has no auth and no user accounts — every project in the database is visible to whoever can
reach the app, which today is one developer on `localhost`. The data itself is a developer's own
software-project planning notes (requirements, architecture, tech choices, decisions) — not PII,
not payment data, not health data. It's sensitive in the ordinary "this is someone's unreleased
project plan" sense, not in a regulated-data sense. This posture changes the moment multi-user
auth is added (Stage 2/3, deliberately deferred — see `docs/decisions/`), since projects would
then need to be scoped per user rather than globally visible.

## Secrets

- Credentials live in `.env.local` (gitignored — see `.gitignore`), with `.env.example` as the
  committed template. **Never commit real secrets. Never log or print a secret's value** — check
  presence only, never the value, when debugging config.
- Keep `.env.example` in sync whenever a new setting is added.
- If a real secret is ever exposed (committed, logged, pasted somewhere): rotate it immediately.
  Deleting it from a later commit doesn't remove it from history.

## Third-party data exposure

Every interview message and the full structured `ProjectKnowledge` summary (see
`src/lib/llm/context.ts`) is sent to whichever LLM provider `LLM_PROVIDER` selects (Anthropic or
OpenAI's API). That's the entire point of the product, so it's expected — but it means a
developer's project plan (which could describe a not-yet-public product) leaves this
infrastructure on every interview turn and every plan generation. No other third party receives
any data in v0.1.

## Injection / untrusted input

- Database queries: all through Prisma's query builder — no raw/string-concatenated SQL anywhere
  in this codebase.
- No file uploads or binary parsing exist in v0.1 — nothing to mitigate here yet.
- The LLM's tool-call arguments (`src/lib/llm/interviewTools.ts`) are Zod-validated before
  touching the database, same as any other untrusted input, even though the "caller" is a model
  rather than a browser.

## Network exposure

- Auth: none. Anyone who can reach the running app (today: `localhost` only) can read and modify
  every project. This is the single biggest gap before this could ever be deployed anywhere
  reachable by anyone else — deliberately out of scope for v0.1 (see `docs/decisions/`), but must
  be resolved before this leaves localhost.
- Rate limiting: none. A local single-user prototype has no need for it yet, but it also means
  nothing currently caps LLM API spend if the app were exposed.
- CORS: unconfigured (default Next.js same-origin behavior) — fine as long as this stays
  localhost-only.
- Default credentials: `docker-compose.yml`'s Postgres user/password (`architectcoach`/
  `architectcoach`) are placeholder local-dev credentials. **These must never be reused in any
  shared or deployed environment.**

## Dependencies

No automated dependency vulnerability scanning configured yet (no Dependabot, no `npm audit` in
CI) — there is no CI at all yet for this prototype. Known gap, not a deliberate choice.

## Reporting a concern

No formal process yet — single-developer prototype, no external users.
