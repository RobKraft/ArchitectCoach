# Decisions already made — Static website

Made in ArchitectCoach's wizard. Treat these as settled (see AGENTS.md, rule 1).
Cost figures are rough monthly ballparks as of October 2026; check current vendor pricing.

**Purpose:** Team's "booking" site & admin <beta>

## Who is this static website for?

**Chosen:** Business or organization marketing site

Public-facing site for a company, nonprofit, or group to present information, build credibility, and drive conversions.

**Tradeoffs:** Needs to look polished and load fast since it affects credibility directly, and you'll likely want basic analytics and a contact path — but still doesn't need a database for most marketing sites.

**Alternatives not chosen:** Personal portfolio or blog; Documentation or knowledge base; Event or campaign landing page

## What's the main goal for this site?

**Chosen:** Convert visitors into leads or customers

Clear calls to action, a contact or signup path, and basic analytics to see what's working.

**Tradeoffs:** Needs at least one third-party integration (a form handler and/or analytics), which is the first thing that pushes a "pure" static site to depend on an external service.

**Alternatives not chosen:** Get discovered through search and attract visitors organically; Provide reliable reference information people can search; Drive signups or registrations for a specific event

## How should this site be built?

**Chosen:** Static site generator (e.g. Eleventy, Hugo, Jekyll)

Write content in templates/Markdown; the generator builds plain HTML at build time.

**Tradeoffs:** Shared layout and reusable content become easy, and output is still plain fast HTML — but you're adding a build step and a tool-specific templating language to learn.

**Alternatives not chosen:** Plain HTML, CSS, and JavaScript; Component framework exported as static files (e.g. Next.js/Astro static export)

### What this means in practice

- **Deployment complexity:** Low. One build command produces a folder of files. Most hosts run the build for you on every git push.
- **Accounts & integrations to manage:** Git repository (e.g. GitHub); Hosting account; Domain registrar. Adds a git repo, which most hosts connect to for automatic builds.
- **Ballpark cost:** Free. Generators are open source. Build minutes are free at this size on every major host.
- **Security concerns:** Output is still plain files, so the live site has almost nothing to attack. Build-time npm/gem dependencies can carry supply-chain risk — pin versions and use Dependabot.
- **Scalability:** High. Serves any traffic a CDN can. Builds slow down past a few thousand pages (Hugo stays fast; Jekyll gets slow).
- **Governance, risk & compliance:** Check the theme's license if you use one. Same privacy-notice needs as any site that adds analytics or forms.
- **Auditing for correctness:** Fail the build on broken internal links (most generators have a plugin), and use the host's deploy previews to review changes before they go live.
- **Staying on top of costs:** Watch the host's build-minute usage if you rebuild very often; otherwise nothing.
- **Performance:** Excellent — output is pre-rendered HTML with little or no JavaScript.

## Where should this site be hosted?

**Chosen:** Netlify

Static hosting with built-in CI/CD, form handling, and a generous free tier.

**Tradeoffs:** The built-in form handling is genuinely useful for a static site with no backend, but you're depending on a third-party platform for that feature rather than owning it.

**Alternatives not chosen:** GitHub Pages; Vercel; Traditional web hosting (shared hosting or a VPS)

### What this means in practice

- **Deployment complexity:** Low. Connect a git repo; every push builds and deploys, and every PR gets a preview URL.
- **Accounts & integrations to manage:** Netlify account; Git repository; Domain registrar. Built-in forms and functions can replace other services if you need them later.
- **Ballpark cost:** Free. Free tier covers most small sites. Pro is ~$19 per team member per month once you need more.
- **Security concerns:** Free HTTPS, configurable security headers, and password-protected deploy previews on paid plans.
- **Scalability:** High. Global CDN. The free tier has bandwidth/build-credit limits; past them the site pauses or you upgrade.
- **Governance, risk & compliance:** Netlify is a US company; check its DPA if visitors are in the EU. Free-tier usage is subject to fair-use terms.
- **Auditing for correctness:** Deploy log and one-click rollback to any previous deploy; deploy previews let someone review before merging.
- **Staying on top of costs:** Set usage notifications in team settings — overages (bandwidth, form submissions, function calls) are where surprise bills come from.
- **Performance:** Excellent for static files; fast global CDN with sensible cache defaults.

## Do you need visitor analytics?

**Chosen:** Privacy-friendly analytics (e.g. Plausible, Fathom)

Lightweight, cookie-free analytics services built around not tracking individual visitors.

**Tradeoffs:** Usually a paid service (small monthly cost) and less granular than Google Analytics, but no cookie-consent banner needed and better visitor privacy.

**Alternatives not chosen:** No analytics needed; Google Analytics

### What this means in practice

- **Deployment complexity:** Low. Add one script tag to your page template.
- **Accounts & integrations to manage:** Analytics vendor account (e.g. Plausible, Fathom). One more account to keep paid and secured.
- **Ballpark cost:** ~$10/mo. ~$9–15/mo for small traffic; priced by monthly pageviews. Plausible can be self-hosted for free.
- **Security concerns:** A third-party script runs on every page. Choose a reputable vendor and consider loading it through your own domain.
- **Scalability:** High. The vendor handles scale; cost rises with pageviews.
- **Governance, risk & compliance:** Cookie-free and designed to need no consent banner under GDPR. Still mention it in your privacy notice.
- **Auditing for correctness:** Compare its numbers against your host's request logs occasionally; set up goal tracking to confirm events fire.
- **Staying on top of costs:** Plans are pageview tiers — check usage monthly so a traffic spike doesn't bump you up a tier unexpectedly.
- **Performance:** Negligible impact: the script is under ~1 KB.

## Changes after the wizard

_Record any decision changed during spec/plan work here: what changed, why, and what it affects._
