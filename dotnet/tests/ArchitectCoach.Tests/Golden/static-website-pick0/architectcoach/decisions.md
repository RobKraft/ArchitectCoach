# Decisions already made — Static website

Made in ArchitectCoach's wizard. Treat these as settled (see AGENTS.md, rule 1).
Cost figures are rough monthly ballparks as of October 2026; check current vendor pricing.

**Purpose:** Project 0 purpose

## Who is this static website for?

**Chosen:** Personal portfolio or blog

Showcasing your own work, writing, or projects to potential employers, clients, or readers.

**Tradeoffs:** Low stakes if something's imperfect, but it also means less pressure to over-engineer — a good fit for the simplest possible setup. Growth is usually slow and content-driven, not traffic-spike-driven.

**Alternatives not chosen:** Business or organization marketing site; Documentation or knowledge base; Event or campaign landing page

## What's the main goal for this site?

**Chosen:** Get discovered through search and attract visitors organically

Content and SEO fundamentals (clean URLs, fast loads, good metadata) matter most.

**Tradeoffs:** Pays off slowly — organic traffic takes months to build — but doesn't require any ongoing spend or infrastructure beyond hosting.

**Alternatives not chosen:** Convert visitors into leads or customers; Provide reliable reference information people can search; Drive signups or registrations for a specific event

## How should this site be built?

**Chosen:** Plain HTML, CSS, and JavaScript

Hand-written pages, no build step, no framework.

**Tradeoffs:** Zero tooling to learn or maintain, but repeating shared elements (nav, footer) across pages is manual and error-prone as the site grows past a handful of pages.

**Alternatives not chosen:** Static site generator (e.g. Eleventy, Hugo, Jekyll); Component framework exported as static files (e.g. Next.js/Astro static export)

### What this means in practice

- **Deployment complexity:** Low. No build step — upload the files and you're done. Any host that serves files works.
- **Accounts & integrations to manage:** Hosting account; Domain registrar. Nothing beyond where the files live and the domain name.
- **Ballpark cost:** Free. The tooling costs nothing; you only pay for hosting and the domain (~$1/mo averaged).
- **Security concerns:** Smallest possible attack surface: no server code, no dependencies to patch. Main risks are leaked hosting credentials and any third-party scripts you paste in.
- **Scalability:** High. Traffic scales as well as your host does. What doesn't scale is authoring — shared headers/footers get copy-pasted into every page past ~10 pages.
- **Governance, risk & compliance:** Few concerns. Add a privacy notice if you add analytics or forms, and keep license notices for any copied CSS/JS.
- **Auditing for correctness:** Run an HTML validator and a broken-link checker before each upload; check pages with Lighthouse for accessibility.
- **Staying on top of costs:** Nothing to monitor here — the cost lives with the hosting choice.
- **Performance:** Excellent by default: no framework JavaScript to download. Optimize images and you'll score near-perfect.

## Where should this site be hosted?

**Chosen:** GitHub Pages

Free hosting straight from a GitHub repo.

**Tradeoffs:** Free and simple, but fewer built-in features (no server-side redirects, limited build customization) than a dedicated static host.

**Alternatives not chosen:** Netlify; Vercel; Traditional web hosting (shared hosting or a VPS)

### What this means in practice

- **Deployment complexity:** Low. Push to a branch or run a GitHub Actions workflow; HTTPS and custom domains are built in.
- **Accounts & integrations to manage:** GitHub account; Domain registrar. Code and hosting live in the same account.
- **Ballpark cost:** Free. Free for public repos. Private-repo Pages needs a paid GitHub plan (~$4/mo).
- **Security concerns:** Free HTTPS. Turn on 2FA for GitHub — whoever controls the repo controls the site. No custom security headers (e.g. CSP) are possible.
- **Scalability:** Medium. Soft limits: ~100 GB/month bandwidth and a 1 GB site size. Not meant for commercial, high-traffic sites.
- **Governance, risk & compliance:** GitHub's terms discourage using Pages mainly for commercial transactions. Content in a public repo is visible to everyone.
- **Auditing for correctness:** The Actions log shows each deploy; every change is a git commit, so you get a full audit trail automatically.
- **Staying on top of costs:** Nothing to monitor — no usage billing.
- **Performance:** Good: served from GitHub's CDN. Less control over caching than Netlify/Vercel.

## Do you need visitor analytics?

**Chosen:** No analytics needed

Skip analytics entirely for now.

**Tradeoffs:** Simplest and most private option, but you'll have no visibility into traffic or what content is actually working.

**Alternatives not chosen:** Privacy-friendly analytics (e.g. Plausible, Fathom); Google Analytics

### What this means in practice

- **Deployment complexity:** Low. Nothing to deploy.
- **Accounts & integrations to manage:** None. No extra accounts.
- **Ballpark cost:** Free. No cost.
- **Security concerns:** No third-party script on your pages — nothing that could be compromised to inject code.
- **Scalability:** High. Not applicable — nothing to scale.
- **Governance, risk & compliance:** Simplest compliance position: no tracking, no cookie banner needed for analytics.
- **Auditing for correctness:** Your host may still show basic request counts if you need a rough sense of traffic.
- **Staying on top of costs:** Nothing to monitor.
- **Performance:** Best possible — no extra script to load.

## Changes after the wizard

_Record any decision changed during spec/plan work here: what changed, why, and what it affects._
