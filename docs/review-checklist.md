# Review checklist

What a reviewer (human or AI) should actually check before approving a change — beyond "does it
look reasonable." Pairs with `definition-of-done.md` (what the author should have already done)
and the PR template (what they should have reported).

## Correctness

- [ ] Does the change do what the PR description says it does? Re-derive this from the diff —
      don't just trust the description.
- [ ] Are there tests that would actually fail if the change were reverted or broken? A test that
      passes both before and after a change proves nothing.
- [ ] For anything touching a real external integration: was this verified against real data (not
      just mocks), and is the evidence for that in the PR? Projects that skip this step tend to
      ship the exact class of bug that only real data exposes — see `testing-standards.md`.

## Architecture and layering

- [ ] Does this respect the project's established layering rules (see its `docs/architecture.md`
      and `decisions/`)? A module shouldn't reach into a layer it isn't supposed to.
- [ ] Is a new external dependency (HTTP client, SDK, provider) injectable per
      `coding-standards.md`, not hardcoded to a concrete instance?
- [ ] If this is a genuinely new architectural decision (not just an implementation detail), is
      there an ADR? If not, ask for one before approving — don't let it live only in the PR
      description.

## Security

- [ ] Any new external call, new trust boundary, or new place untrusted input is processed — is
      it covered by `security-checklist.md`, or does that doc need updating?
- [ ] Any new secret/credential — is it in the example/template file as a placeholder, never a
      real value, never logged or printed?
- [ ] Data access — still built through the query builder/ORM, never string-interpolated?

## Tests

- [ ] Do new tests follow the established patterns in `testing-standards.md` (mock external
      calls, inject fake clients, properly isolate any integration test against shared
      infrastructure)?
- [ ] Does a new test against shared local infrastructure assume it's empty? (It shouldn't.)

## Docs

- [ ] Status docs (`README`, `CLAUDE.md`, or equivalent) updated to match reality.
- [ ] Any doc this change makes stale (architecture doc, API guidelines, security checklist) is
      updated in the same PR, not left for later.

## Scope

- [ ] Does the PR do one coherent thing? A bug fix bundled with an unrelated refactor makes both
      harder to review and harder to revert independently.
- [ ] Is there speculative/unused code — an abstraction, a config flag, a fallback path — added
      for a need that doesn't exist yet? Flag it; don't build for hypothetical future
      requirements.
