# Coding standards

## Build approach

Component framework exported as static files (e.g. Next.js/Astro static export)

This project uses a component framework exported as static files. Conventions:
- Components are the unit of reuse — don't duplicate markup across pages that could be one shared component.
- Before adding a feature, confirm it stays compatible with static export mode — some framework features require a live server and silently break static export.
- Run the actual static export build locally before pushing; export-time errors don't always show up in the dev server.

## Naming and structure

- File and folder names: lowercase, hyphen-separated (e.g. `about-us.html`, `blog-post-name.md`).
- Keep a page's own assets near that page rather than in one giant shared folder, unless the asset is genuinely reused elsewhere.

## Formatting

- Use a formatter (Prettier, or the generator's built-in formatting) and run it before committing — don't review whitespace by eye.

## Accessibility baseline

Treated as a coding standard, not an afterthought — see `accessibility-checklist.md` for what to check on every page added.
