# Coding standards

## Build approach

Not yet decided — revisit after finishing the ArchitectCoach interview.

This project is plain HTML, CSS, and JavaScript with no build step. Conventions:
- There's no templating, so shared markup (nav, footer) has to be kept in sync by hand across pages — a review question is "did this change need to happen on every page, and did it?"
- Prefer one shared stylesheet over inline styles or per-page `<style>` blocks, so visual conventions stay in one place.
- Keep JavaScript minimal. The architecture decision here was deliberately to avoid a framework/build step — don't let one back in through a JS library.

## Naming and structure

- File and folder names: lowercase, hyphen-separated (e.g. `about-us.html`, `blog-post-name.md`).
- Keep a page's own assets near that page rather than in one giant shared folder, unless the asset is genuinely reused elsewhere.

## Formatting

- Use a formatter (Prettier, or the generator's built-in formatting) and run it before committing — don't review whitespace by eye.

## Accessibility baseline

Treated as a coding standard, not an afterthought — see `accessibility-checklist.md` for what to check on every page added.
