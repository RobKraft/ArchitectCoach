# Decisions already made — Static site with a blog

Made in ArchitectCoach's wizard. Treat these as settled (see AGENTS.md, rule 1).
Cost figures are rough monthly ballparks as of October 2026; check current vendor pricing.

**Purpose:** Team's "booking" site & admin <beta>

## Who is this blog for?

**Chosen:** Company or product blog for marketing/SEO

Public-facing posts that support a business's marketing and search visibility.

**Tradeoffs:** Usually needs consistent publishing and basic analytics to justify the effort, and content review/approval becomes a real workflow question.

**Alternatives not chosen:** Personal audience — writing under your own name; Team or engineering blog sharing technical updates; Multi-author publication with several regular contributors

## What's the main goal for the blog?

**Chosen:** Drive traffic and leads for a business

Posts exist to bring visitors to a product or service and convert some of them.

**Tradeoffs:** Worth investing in SEO fundamentals and analytics from day one, since the whole point is measurable traffic.

**Alternatives not chosen:** Build a personal audience or portfolio over time; Keep existing users or customers informed with updates; Establish authority or expertise in a topic area

## How should posts be authored and the site built?

**Chosen:** Headless CMS (e.g. Contentful, Sanity) plus a static site generator

Content is authored in a web editor and pulled into a static-generated site at build time.

**Tradeoffs:** Non-technical authors can write and publish without touching code, but you're adding a paid third-party service and a content-fetching build step.

**Alternatives not chosen:** Markdown files in a static site generator (e.g. Hugo, Eleventy, Jekyll); All-in-one blogging platform (e.g. WordPress, Ghost)

### What this means in practice

- **Deployment complexity:** Medium. Two systems to wire: the CMS triggers a rebuild through a webhook whenever someone publishes.
- **Accounts & integrations to manage:** Headless CMS (e.g. Contentful, Sanity); Git repository; Hosting account; Domain registrar. Plus API keys and a rebuild webhook to manage between them.
- **Ballpark cost:** Free. Free tiers cover a solo blog. Team features jump fast: Sanity ~$15/seat/mo, Contentful's paid tier is ~$300/mo.
- **Security concerns:** CMS API tokens must stay server/build-side only. Writers' CMS accounts need 2FA and the least access they need.
- **Scalability:** High. The site still serves static files; CMS API rate limits only matter at build time.
- **Governance, risk & compliance:** Content lives in a vendor's database — check export options and where the data is hosted. Your writers' accounts are personal data held by the vendor.
- **Auditing for correctness:** CMS version history shows who changed what; check that the publish webhook actually triggers a rebuild (failed builds are easy to miss).
- **Staying on top of costs:** Watch seat count, API calls, and asset bandwidth against the free tier's limits.
- **Performance:** Excellent for readers (static output). Builds take longer because they fetch content over the API.

## Where should this be hosted?

**Chosen:** Netlify

Static hosting with CI/CD and webhook-triggered rebuilds — a good fit if a headless CMS is involved.

**Tradeoffs:** Free tier is generous, but rebuild minutes and bandwidth are metered once you outgrow it.

**Alternatives not chosen:** GitHub Pages; Vercel; Managed hosting for your platform (e.g. WordPress.com, Ghost(Pro))

### What this means in practice

- **Deployment complexity:** Low. Git-push deploys plus preview URLs to review a post before it goes live.
- **Accounts & integrations to manage:** Netlify account; Git repository; Domain registrar. Netlify Forms can handle a newsletter signup without another service.
- **Ballpark cost:** Free. Free tier fits most blogs; Pro ~$19/member/mo.
- **Security concerns:** Free HTTPS and configurable security headers.
- **Scalability:** High. Global CDN; free-tier bandwidth limits apply.
- **Governance, risk & compliance:** Check the DPA for EU readers, especially if you use Netlify Forms to collect emails.
- **Auditing for correctness:** Deploy log and one-click rollback.
- **Staying on top of costs:** Set usage notifications — a viral post can exhaust free bandwidth.
- **Performance:** Excellent.

## Do you want reader comments on posts?

**Chosen:** Lightweight third-party comments (e.g. giscus, Disqus)

Comments are handled entirely by an embedded third-party widget.

**Tradeoffs:** Keeps the site static with no backend of your own, but you depend on that service staying available and it may show ads or track visitors depending on which one you pick.

**Alternatives not chosen:** No comments; Full custom comments (requires a backend and database)

### What this means in practice

- **Deployment complexity:** Low. Add an embed script to your post template.
- **Accounts & integrations to manage:** Comment service (giscus uses GitHub Discussions; Disqus has its own account). Readers also need an account with that service to comment.
- **Ballpark cost:** Free. giscus is free. Disqus is free with ads; ad-free plans start ~$11/mo.
- **Security concerns:** Spam and abuse moderation become your job. The embed is a third-party script on your pages.
- **Scalability:** High. The vendor handles the load.
- **Governance, risk & compliance:** Disqus's free tier serves ads and tracks readers — needs consent handling in the EU. giscus stores comments publicly on GitHub.
- **Auditing for correctness:** Check moderation queues regularly; make sure comments load on a sample of old posts after theme changes.
- **Staying on top of costs:** Free tiers usually stay free; watch for changes to Disqus's plans.
- **Performance:** giscus is light; Disqus adds noticeable weight from ads and trackers. Lazy-load either below the fold.

## Changes after the wizard

_Record any decision changed during spec/plan work here: what changed, why, and what it affects._
