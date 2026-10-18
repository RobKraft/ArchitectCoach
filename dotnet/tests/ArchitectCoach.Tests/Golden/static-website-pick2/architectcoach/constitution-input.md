# Constitution input — Static website

Give this to `/speckit.constitution`, together with the answers to the budget, compliance,
sensitive-data, user-location, accessibility, and performance questions in `open-questions.md`.
These are the principles every spec, plan, and task must respect.

## 1. The architecture decisions are binding

- Who is this static website for? → **Documentation or knowledge base**
- What's the main goal for this site? → **Provide reliable reference information people can search**
- How should this site be built? → **Component framework exported as static files (e.g. Next.js/Astro static export)**
- Where should this site be hosted? → **Vercel**
- Do you need visitor analytics? → **Google Analytics**

Changing one requires recording why in `decisions.md` ("Changes after the wizard") first.

## 2. Simplicity first

Build the smallest thing that meets the spec. No extra services, layers, or abstractions
without a stated reason tied to a requirement.

## 3. Every task is verifiable

Each task has a "done" check — an automated test where practical, otherwise a written manual
check. Nothing is done until its check passes.

## 4. Privacy by design

Collect the minimum personal data the spec requires. Every personal-data field has a stated
purpose, a retention period, and a deletion path, all recorded in the PII inventory. Users can
see, export, and delete their data where privacy law (GDPR, CCPA) applies. No tracking or
advertising cookies without opt-in consent. Never log personal data, passwords, or tokens.
Details: `privacy-and-accessibility.md`.

## 5. Accessible by default

Every user interface meets **WCAG 2.2 AA**. Accessibility is part of "done" for every UI task:
keyboard operable, screen-reader labeled, sufficient contrast, and checked with automated tools
plus a manual pass. Details: `privacy-and-accessibility.md`.

## 6. Security

- _Component framework exported as static files (e.g. Next.js/Astro static export):_ The live site is still static, but the dependency tree is hundreds of npm packages. Keep them updated and avoid exposing secrets in client-side environment variables.
- _Vercel:_ Free HTTPS, configurable headers, deployment protection for previews. Keep team access tight — anyone with access can deploy.
- _Google Analytics:_ A large third-party script on every page. Grant property access per person, not via shared logins.

## 7. Governance, risk & compliance

- _Component framework exported as static files (e.g. Next.js/Astro static export):_ Watch for framework features that quietly assume a server or a specific vendor (e.g. image optimization) — it's a lock-in risk, not a compliance one.
- _Vercel:_ The Hobby plan's non-commercial rule is a compliance issue in itself for a business site. Check the DPA for EU visitors.
- _Google Analytics:_ Uses cookies and personal data: needs a consent banner for EU/UK visitors, a privacy-policy disclosure, and data-retention settings. Some EU regulators have challenged its use.

## 8. Cost guardrails

Set a budget alert on every paid account at the monthly limit from `open-questions.md`.

- _Component framework exported as static files (e.g. Next.js/Astro static export):_ Nothing beyond hosting. Watch for accidentally using features that need a paid server runtime.
- _Vercel:_ Enable spend management and set a hard spending cap on Pro — function or bandwidth overages are the usual surprise.
- _Google Analytics:_ Free, but count the time cost of consent management and reporting setup.

## 9. Auditing for correctness

- _Component framework exported as static files (e.g. Next.js/Astro static export):_ Add a few component tests plus a link checker in CI; compare Lighthouse scores before and after framework upgrades.
- _Vercel:_ Deployment history with instant rollback; preview URLs per branch for review.
- _Google Analytics:_ Use GA4's DebugView to confirm events fire; check that consent mode actually blocks tracking before consent.

## 10. Performance

- _Component framework exported as static files (e.g. Next.js/Astro static export):_ Very good, but ships more JavaScript than a plain generator. Astro ships near-zero JS by default; Next.js ships React's runtime.
- _Vercel:_ Excellent; fast edge CDN with framework-aware caching.
- _Google Analytics:_ Adds ~50–100 KB of script; minor but measurable impact on load time.
