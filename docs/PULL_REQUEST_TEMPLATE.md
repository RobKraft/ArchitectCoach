<!--
Copy this to .github/PULL_REQUEST_TEMPLATE.md in the new project.
Fill in every section below. "N/A — <reason>" is a fine answer when a section genuinely doesn't
apply, but it must be a reason, not silence. See review-checklist.md for what a reviewer will
check, and definition-of-done.md for what should already be true before you open this.
-->

## Summary

<!-- One or two sentences: what changed and why. -->

## ✓ Code changes

<!-- What changed, at a level a reviewer can use as a map through the diff. Not a restatement of
     every line — the "why this shape" that isn't obvious from the diff alone. -->

## ✓ Tests

<!-- What's covered and how, per testing-standards.md: which external calls are mocked and how,
     which integration tests touch real shared infrastructure, and — for anything touching a real
     external system — what live smoke-test verification was done against real data. Paste
     relevant test output. -->

## ✓ AI conversation

<!-- If AI assistance was involved: link or summarize the relevant conversation so a reviewer can
     see the reasoning, not just the diff — see ai-collaboration.md. If no AI was involved, say
     so. -->

## ✓ Design decisions

<!-- Anything non-obvious about the approach taken, alternatives rejected, and why. If this rises
     to "a future contributor would reasonably ask why this is built this way," it should be an
     ADR in decisions/ (link it here) rather than only living in this PR description. -->

## ✓ Architecture diagrams

<!-- If this changes the module structure or data flow, update the architecture doc's diagram and
     link the relevant section here. N/A if this is a self-contained change. -->

## ✓ Performance analysis

<!-- Anything relevant to latency, throughput, batch sizing, or query cost. N/A if this change
     has no meaningful performance surface. -->

## ✓ Security review

<!-- Any new external call, new trust boundary, new place untrusted input is processed, or new
     secret/credential — checked against security-checklist.md. Explicitly confirm no secrets are
     in the diff. N/A if this change has no security-relevant surface (say why). -->

## ✓ Benchmark results

<!-- Before/after numbers if this claims a performance improvement, or real-data verification
     numbers if this claims a correctness improvement (e.g. "25/25 real records processed
     successfully" beats "should work"). N/A if not applicable. -->
