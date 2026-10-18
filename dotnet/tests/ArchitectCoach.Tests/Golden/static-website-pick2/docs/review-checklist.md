# Review checklist

What a reviewer (human or AI) should actually check before approving a change.

## Correctness

- [ ] Does the change do what its description says? Re-derive this from the diff — don't just trust the description.
- [ ] Was it actually loaded in a browser, not just built successfully?

## Security / performance / accessibility

- [ ] Anything relevant in `security-checklist.md`, `performance-checklist.md`, or `accessibility-checklist.md` — checked, or does one of those docs need updating?

## Scope

- [ ] Does the change do one coherent thing? A content update bundled with an unrelated redesign makes both harder to review and harder to revert independently.
- [ ] Is there speculative/unused markup, config, or a feature flag added for a need that doesn't exist yet? Flag it.

## Docs

- [ ] Is a genuinely new decision (not just an implementation detail) recorded as an ADR in `decisions/`?
