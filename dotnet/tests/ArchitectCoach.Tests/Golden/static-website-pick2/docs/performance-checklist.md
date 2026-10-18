# Performance checklist

Scoped to what matters for a static site — not a generic web-performance checklist.

## Page weight

- [ ] Images are compressed and sized for their actual display size, not the camera's original resolution.
- [ ] No unused CSS/JS is shipped to every page (especially relevant if using a component framework export, where bundling can pull in more than one page needs).

## Loading strategy

- [ ] Images below the fold use `loading="lazy"`.
- [ ] Fonts are loaded with `font-display: swap` (or self-hosted) so text isn't invisible while a web font loads.

## Hosting/CDN

- Vercel serves static assets from a CDN by default — don't add unnecessary caching logic on top of what it already provides.
- Set long cache lifetimes for versioned/hashed assets (images, compiled CSS/JS); shorter ones for HTML pages that change.

## Measuring it

- [ ] Run Lighthouse (or PageSpeed Insights) against the homepage and the page that matters most for the project's main goal, before considering a launch done.
- [ ] Track Core Web Vitals (LCP, CLS, INP) — a passing Lighthouse score today can regress silently as content grows; re-check periodically, not just once.
