# Definition of Done

A change is done when:

- [ ] It does what it was meant to do, verified by actually loading the page(s) affected — not just "the build succeeded."
- [ ] It passes the checks in `testing-standards.md` (link check, HTML validity, Lighthouse thresholds).
- [ ] Anything in `security-checklist.md`, `performance-checklist.md`, or `accessibility-checklist.md` that this change touches has been checked, not assumed fine.
- [ ] Any doc this change makes stale (this kit's docs, or the project's own README) is updated in the same change, not left for later.
- [ ] If this change involved a genuinely new decision (not just an implementation detail), it's recorded as an ADR in `decisions/`.
