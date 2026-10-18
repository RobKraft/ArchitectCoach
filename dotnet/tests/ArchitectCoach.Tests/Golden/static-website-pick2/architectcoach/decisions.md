# Decisions already made — Static website

Made in ArchitectCoach's wizard. Treat these as settled (see AGENTS.md, rule 1).
Cost figures are rough monthly ballparks as of October 2026; check current vendor pricing.

**Purpose:** _Not stated — ask the developer._

## Who is this static website for?

**Chosen:** Documentation or knowledge base

Technical docs, guides, or reference material for developers, users, or an internal team.

**Tradeoffs:** Search and navigation matter more than visual design here, which pushes toward a static site generator with built-in search rather than hand-written HTML.

**Alternatives not chosen:** Personal portfolio or blog; Business or organization marketing site; Event or campaign landing page

## What's the main goal for this site?

**Chosen:** Provide reliable reference information people can search

Findability and accuracy matter more than persuasion or visual polish.

**Tradeoffs:** Content maintenance becomes the real ongoing cost, not the code — stale docs are worse than no docs.

**Alternatives not chosen:** Get discovered through search and attract visitors organically; Convert visitors into leads or customers; Drive signups or registrations for a specific event

## How should this site be built?

**Chosen:** Component framework exported as static files (e.g. Next.js/Astro static export)

Build the site with a modern component framework, then export it to static HTML/JS at build time.

**Tradeoffs:** Most powerful option for interactive components and future growth, but it's the heaviest tooling for a site that may never need it — overkill for a simple brochure site or blog.

**Alternatives not chosen:** Plain HTML, CSS, and JavaScript; Static site generator (e.g. Eleventy, Hugo, Jekyll)

### What this means in practice

- **Deployment complexity:** Medium. A build step plus framework config (static export mode, image handling, base paths). More things can break between versions.
- **Accounts & integrations to manage:** Git repository (e.g. GitHub); Hosting account; Domain registrar. A git repo connected to the host for automatic builds, with a larger npm dependency tree to keep updated.
- **Ballpark cost:** Free. Free tooling. Build times are longer, but still well within free build minutes for small sites.
- **Security concerns:** The live site is still static, but the dependency tree is hundreds of npm packages. Keep them updated and avoid exposing secrets in client-side environment variables.
- **Scalability:** High. Serves any traffic. The main benefit is that you can later switch to server rendering without rewriting components.
- **Governance, risk & compliance:** Watch for framework features that quietly assume a server or a specific vendor (e.g. image optimization) — it's a lock-in risk, not a compliance one.
- **Auditing for correctness:** Add a few component tests plus a link checker in CI; compare Lighthouse scores before and after framework upgrades.
- **Staying on top of costs:** Nothing beyond hosting. Watch for accidentally using features that need a paid server runtime.
- **Performance:** Very good, but ships more JavaScript than a plain generator. Astro ships near-zero JS by default; Next.js ships React's runtime.

## Where should this site be hosted?

**Chosen:** Vercel

Static hosting with strong support for modern frontend frameworks and fast global CDN delivery.

**Tradeoffs:** Excellent if the build approach above is a component framework; less of an advantage for plain HTML or a generator site where Netlify's form handling matters more.

**Alternatives not chosen:** GitHub Pages; Netlify; Traditional web hosting (shared hosting or a VPS)

### What this means in practice

- **Deployment complexity:** Low. Connect a git repo; every push builds and deploys with preview URLs. Especially good support for Next.js.
- **Accounts & integrations to manage:** Vercel account; Git repository; Domain registrar. Built-in analytics and serverless functions are available as add-ons.
- **Ballpark cost:** Free. The Hobby plan is free but non-commercial only. A business site needs Pro (~$20 per member per month).
- **Security concerns:** Free HTTPS, configurable headers, deployment protection for previews. Keep team access tight — anyone with access can deploy.
- **Scalability:** High. Global edge network handles traffic spikes easily; usage-based billing above the included amounts.
- **Governance, risk & compliance:** The Hobby plan's non-commercial rule is a compliance issue in itself for a business site. Check the DPA for EU visitors.
- **Auditing for correctness:** Deployment history with instant rollback; preview URLs per branch for review.
- **Staying on top of costs:** Enable spend management and set a hard spending cap on Pro — function or bandwidth overages are the usual surprise.
- **Performance:** Excellent; fast edge CDN with framework-aware caching.

## Do you need visitor analytics?

**Chosen:** Google Analytics

The most widely used analytics platform, free, with deep reporting features.

**Tradeoffs:** Free and extremely capable, but adds real tracking of individual visitors, which typically requires a cookie-consent banner depending on your audience's location.

**Alternatives not chosen:** No analytics needed; Privacy-friendly analytics (e.g. Plausible, Fathom)

### What this means in practice

- **Deployment complexity:** Low. Add the tag; setting up GA4 events and reports properly takes longer than installing it.
- **Accounts & integrations to manage:** Google account (Analytics property); Cookie-consent tool (if you have EU visitors). Usually also implies a consent-banner service.
- **Ballpark cost:** Free. Free. A consent-management tool may cost ~$0–10/mo.
- **Security concerns:** A large third-party script on every page. Grant property access per person, not via shared logins.
- **Scalability:** High. Handles any traffic; data sampling kicks in for very large reports.
- **Governance, risk & compliance:** Uses cookies and personal data: needs a consent banner for EU/UK visitors, a privacy-policy disclosure, and data-retention settings. Some EU regulators have challenged its use.
- **Auditing for correctness:** Use GA4's DebugView to confirm events fire; check that consent mode actually blocks tracking before consent.
- **Staying on top of costs:** Free, but count the time cost of consent management and reporting setup.
- **Performance:** Adds ~50–100 KB of script; minor but measurable impact on load time.

## Changes after the wizard

_Record any decision changed during spec/plan work here: what changed, why, and what it affects._
