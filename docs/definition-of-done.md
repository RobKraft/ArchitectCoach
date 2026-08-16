# Definition of Done

A change is done when all of the following are true — not just "the happy path works once." This
doc rarely needs much project-specific customization; the `[bracketed]` bits are the only parts
to adapt.

## Always

- [ ] **Tests pass**: the full test suite is green, including any integration tests against real
      local infrastructure (start whatever they need first — don't skip them by accident and
      call it done).
- [ ] **Lint/format checks are clean**: `[your linter/formatter command]` passes with no findings.
- [ ] **No secrets committed**: check the diff before committing — a secrets file must never
      appear staged. If a new setting was added, the example/template file is updated to match
      (see `security-checklist.md`).
- [ ] **New external dependencies are injectable and mocked in tests**, per
      `coding-standards.md`'s dependency-injection pattern and `testing-standards.md`'s mocking
      patterns — not tested only by hand.

## If you touched an integration with a real external system (API, file format, third-party service)

- [ ] **Verified against the real thing, at least once, by hand** — a live smoke test (see
      `testing-standards.md`'s "Live smoke tests" section) proving the change actually works
      against real data, not just fixtures. Mocked tests alone often don't catch what real,
      messy, real-world input catches.
- [ ] Any established layering rule is respected — a module doesn't reach into a layer it
      shouldn't per this project's `docs/architecture.md`.

## If you made an architecturally significant choice

- [ ] It's captured as an ADR in `decisions/` (see `decisions/template.md`) — not just explained
      in a commit message or a conversation that won't be there for the next person.
      "Significant" means: it constrains future choices, it wasn't the only reasonable option, or
      a future contributor would reasonably ask "why is this built this way."

## Docs kept in sync, not just code

- [ ] The project's status doc (`README.md`'s status section, `CLAUDE.md`, or equivalent)
      reflects what actually works now, not what worked before this change.
- [ ] Any doc this change makes stale is updated in the same PR — the architecture doc if module
      structure/data flow changed, the API guidelines if the API surface changed, the security
      checklist if a new external call or trust boundary was introduced.

## Before opening a pull request

See `review-checklist.md` for what a reviewer will check, and the PR template
(`PULL_REQUEST_TEMPLATE.md`) for what to fill in.
