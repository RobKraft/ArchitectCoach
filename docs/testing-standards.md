# Testing standards

See `apps/local-govt-reporter-ai/docs/testing-standards.md` for a fully filled-in real example,
including a real bug (a test that assumed a shared database table was empty, and broke the
moment real data existed) that shaped the rules below.

**In this project:** the one external system is the LLM API (Anthropic/OpenAI) — no automated
test calls it for real (it's non-deterministic and costs money); tests exercise
`src/lib/llm/context.ts` and `src/lib/llm/planPrompt.ts`'s pure prompt-assembly logic instead, and
prove `src/lib/llm/interviewTools.ts`'s DB-writing behavior directly, without going through a
model. Postgres is the one thing tested against real local infrastructure (`docker-compose.yml`),
per the "shared local infrastructure" pattern below.

## The rule: never hit a real external API from the automated test suite

Third-party APIs are rate-limited, sometimes costly, sometimes flaky, and outside your control.
**No test in the automated suite should call one for real.** Every external dependency should be
injectable (see `coding-standards.md`) specifically so tests can substitute a double.

The one deliberate exception worth considering: **infrastructure you already require for local
development** (a local database, a local queue) rather than a genuine third party. Integration
tests against that are valuable precisely because a mock can't prove the real
query/schema/transaction behavior actually works — but see the isolation rule below before
writing one.

## Pattern: mock HTTP with fixtures captured from the real API

Capture a couple of real responses first (a manual request against the real endpoint, trimmed
down to the relevant fields), then build test fixtures from those — not from guessing the schema.
Real APIs have real surprises (a field that's sometimes `null`, a name that can be missing) that
you won't invent by guessing.

## Pattern: inject a fake client for third-party SDKs

Build a minimal fake exposing just the methods/shape your code actually calls, and inject it via
the constructor parameter from `coding-standards.md`'s dependency-injection pattern. Tests batching
logic, error handling, and response parsing without needing real credentials or network access.

## Pattern: prefer generating tiny test fixtures over checking in binaries

When you need a realistic file (a PDF, an image, an archive) for a test, consider whether you can
build a minimal valid one programmatically in the test itself rather than committing a binary
fixture file. It keeps the test self-contained and reviewable — you can see exactly what's being
tested from the test file alone, instead of trusting an opaque binary blob.

## Pattern: integration tests against real shared local infrastructure — isolate explicitly

If you write an integration test against a real local database (or similar shared local
infrastructure), follow two rules:

1. **Skip, don't fail, if it isn't running.** Detect the connection failure and skip the test
   with a clear message (e.g. "start it with `[command]`"), rather than failing hard for
   contributors who haven't started it.
2. **Never assume the shared state is empty.** This is the one real lesson worth internalizing:
   a test that works fine against an empty table/queue/store can break the moment real data
   exists alongside it. Give test data an unambiguous marker (a dedicated test-only
   value/prefix/namespace that real data will never use) and scope every query the test makes to
   that marker explicitly — don't rely on the marker alone to provide isolation if the code path
   you're testing does an unfiltered query. Clean up test-inserted data afterward.

## Pattern: test each layer by mocking the layer beneath it

A test for your API/interface layer should mock the business-logic layer beneath it (asserting
"the right function was called with the right arguments, and the response was shaped correctly")
rather than exercising the real logic end to end. Save the real end-to-end proof for the
integration tests one layer down. Each layer's tests should prove that layer's contract, not
re-prove the layer beneath it.

## Live smoke tests: real, deliberate, but not part of the automated suite

Before calling a feature that touches a real external system "done," run it once by hand against
the real thing — the real API, the real file format, the real third-party service — and look at
the actual output. This is a **third, distinct** category of check, separate from the automated
test suite:

- It catches things fixtures can't: real bugs found this way include a large real document's
  content overflowing an assumed size limit, and dense/unusual real-world content behaving
  differently than synthetic test data.
- Do this for any change touching an external integration, before calling it done — see
  `definition-of-done.md`.
- Clean up any state it writes (delete test rows, remove test files) so the live check doesn't
  leave residue in shared systems.
