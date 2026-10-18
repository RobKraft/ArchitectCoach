# Coding standards

## Build approach

Static site generator (e.g. Eleventy, Hugo, Jekyll)

This project uses a static site generator. Conventions:
- Content and templates live wherever the generator expects them (e.g. `_layouts`, `content/`) — never hand-edit the generated build output directory.
- Run the generator's build command before committing any change to content or templates, to catch build errors early rather than at deploy time.
- Keep the generator's config file the single source of truth for site-wide settings (title, base URL, navigation) — don't hardcode them per page.

## Naming and structure

- File and folder names: lowercase, hyphen-separated (e.g. `about-us.html`, `blog-post-name.md`).
- Keep a page's own assets near that page rather than in one giant shared folder, unless the asset is genuinely reused elsewhere.

## Formatting

- Use a formatter (Prettier, or the generator's built-in formatting) and run it before committing — don't review whitespace by eye.

## Accessibility baseline

Treated as a coding standard, not an afterthought — see `accessibility-checklist.md` for what to check on every page added.
