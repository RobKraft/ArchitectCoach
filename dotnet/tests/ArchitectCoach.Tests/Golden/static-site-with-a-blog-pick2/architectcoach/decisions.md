# Decisions already made — Static site with a blog

Made in ArchitectCoach's wizard. Treat these as settled (see AGENTS.md, rule 1).
Cost figures are rough monthly ballparks as of October 2026; check current vendor pricing.

**Purpose:** _Not stated — ask the developer._

## Who is this blog for?

**Chosen:** Team or engineering blog sharing technical updates

Posts from a product/engineering team about what they're building or learning.

**Tradeoffs:** Multiple occasional authors is common, which pushes toward a CMS or Markdown-in-git workflow over a single-author tool.

**Alternatives not chosen:** Personal audience — writing under your own name; Company or product blog for marketing/SEO; Multi-author publication with several regular contributors

## What's the main goal for the blog?

**Chosen:** Keep existing users or customers informed with updates

A changelog/announcements-style blog read mostly by people who already use the product.

**Tradeoffs:** RSS and email notification matter more here than search discoverability.

**Alternatives not chosen:** Build a personal audience or portfolio over time; Drive traffic and leads for a business; Establish authority or expertise in a topic area

## How should posts be authored and the site built?

**Chosen:** All-in-one blogging platform (e.g. WordPress, Ghost)

A dedicated platform that handles authoring, hosting, and publishing together.

**Tradeoffs:** Fastest to start writing and very non-technical-author-friendly, but you're no longer running a "static" site — the platform runs a live server and needs its own maintenance/updates.

**Alternatives not chosen:** Markdown files in a static site generator (e.g. Hugo, Eleventy, Jekyll); Headless CMS (e.g. Contentful, Sanity) plus a static site generator

### What this means in practice

- **Deployment complexity:** Medium. Self-hosted means running a server, a database, and updates. Managed hosting removes most of that.
- **Accounts & integrations to manage:** Platform/hosting account; Database (if self-hosted); Domain registrar; Plugins/themes. Plugins often bring their own vendor accounts and licenses.
- **Ballpark cost:** ~$10/mo. Managed WordPress/Ghost runs ~$5–25/mo; premium themes and plugins add more.
- **Security concerns:** WordPress is the most-attacked platform on the web: plugins and its admin login need constant updates and hardening. Ghost has a smaller attack surface.
- **Scalability:** Medium. Needs caching or a CDN to survive traffic spikes; database-backed pages are heavier than static files.
- **Governance, risk & compliance:** Comments, newsletters, and member signups collect personal data — needs a privacy policy and data-deletion process. Plugin licenses vary.
- **Auditing for correctness:** Turn on automatic security updates, use an activity-log plugin, and test backups by actually restoring one.
- **Staying on top of costs:** Watch renewal pricing and how plugin subscriptions add up; set billing alerts if self-hosting.
- **Performance:** Good with caching, slow without it. Heavy themes and plugins are the usual cause of slowness.

## Where should this be hosted?

**Chosen:** Vercel

Static hosting with strong support for modern frontend frameworks and fast global delivery.

**Tradeoffs:** Excellent if the site is built with a component framework; less differentiated for a plain generator site.

**Alternatives not chosen:** GitHub Pages; Netlify; Managed hosting for your platform (e.g. WordPress.com, Ghost(Pro))

### What this means in practice

- **Deployment complexity:** Low. Git-push deploys with previews; best fit if the blog is built with Next.js.
- **Accounts & integrations to manage:** Vercel account; Git repository; Domain registrar. Optional built-in analytics.
- **Ballpark cost:** Free. Hobby is free but non-commercial; a monetized blog needs Pro (~$20/member/mo).
- **Security concerns:** Free HTTPS, configurable headers, deployment protection.
- **Scalability:** High. Edge network absorbs viral spikes; usage-billed beyond the included amounts.
- **Governance, risk & compliance:** Ads, sponsorships, or paid content count as commercial — that rules out the Hobby plan.
- **Auditing for correctness:** Deployment history with instant rollback.
- **Staying on top of costs:** Set a spend cap on Pro.
- **Performance:** Excellent.

## Do you want reader comments on posts?

**Chosen:** Full custom comments (requires a backend and database)

You build and own the comment system end to end.

**Tradeoffs:** Full control over moderation and data, but this is no longer a static site — it now needs a backend, a database, and ongoing moderation work.

**Alternatives not chosen:** No comments; Lightweight third-party comments (e.g. giscus, Disqus)

### What this means in practice

- **Deployment complexity:** High. Turns a static blog into an app: an API, a database, migrations, and a server or functions to deploy.
- **Accounts & integrations to manage:** API hosting / serverless functions; Database; Spam filtering (e.g. Akismet); Email for notifications. Several new services where before there were none.
- **Ballpark cost:** ~$10/mo. ~$0–25/mo on free-tier databases and functions; grows with traffic and spam volume.
- **Security concerns:** You own input sanitization (XSS), spam, rate limiting, auth, and protecting stored emails. This is the riskiest option.
- **Scalability:** Medium. Depends entirely on what you build; a database-backed write path needs real capacity planning.
- **Governance, risk & compliance:** You become the data controller for reader names and emails: privacy policy, deletion requests, and possibly content-moderation obligations.
- **Auditing for correctness:** Needs automated tests for the API, error monitoring, and checked database backups.
- **Staying on top of costs:** Billing alerts on the database and functions; spam bots can drive up usage-based costs.
- **Performance:** Depends on implementation; load comments asynchronously so they don't slow the page itself.

## Changes after the wizard

_Record any decision changed during spec/plan work here: what changed, why, and what it affects._
