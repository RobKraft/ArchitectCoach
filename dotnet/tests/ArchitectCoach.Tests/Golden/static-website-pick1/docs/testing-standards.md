# Testing standards

## What "tested" means for this project

This is a static site — there's no application logic to unit test the way a backend project
would. What actually catches regressions here:

1. **Links stay valid.** Add a link checker (e.g. `linkinator`, or the site generator's own
   equivalent) to CI, run on every push.
2. **HTML is valid.** Run an HTML validator (e.g. `html-validate`) against the built output.
3. **Pages don't regress in performance or accessibility.** Run Lighthouse CI against the
   pages that matter most — for this project, that's whichever page(s) support "Convert visitors into leads or customers", and fail the build if scores drop below an agreed threshold.

## Before merging

- [ ] Build succeeds locally (or via the host's deploy preview, if it provides one).
- [ ] Every new or changed page loads with no console errors and no broken links.
- [ ] Lighthouse accessibility score checked for any new or changed page.

## Opting out

If this project is small enough that CI-enforced checks aren't worth the setup yet (e.g. a
single-page personal site), say so explicitly here rather than silently having none — an
honest "not doing this yet" is more useful than a stale checklist nobody follows.
