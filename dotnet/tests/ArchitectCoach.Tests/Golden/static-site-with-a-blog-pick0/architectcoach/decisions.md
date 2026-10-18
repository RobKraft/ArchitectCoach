# Decisions already made — Static site with a blog

Made in ArchitectCoach's wizard. Treat these as settled (see AGENTS.md, rule 1).
Cost figures are rough monthly ballparks as of October 2026; check current vendor pricing.

**Purpose:** Project 1 purpose

## Who is this blog for?

**Chosen:** Personal audience — writing under your own name

An individual's blog, built around one voice and one author's interests.

**Tradeoffs:** Simplest to run — no multi-author workflow needed — but growth depends entirely on your own content output and reach.

**Alternatives not chosen:** Company or product blog for marketing/SEO; Team or engineering blog sharing technical updates; Multi-author publication with several regular contributors

## What's the main goal for the blog?

**Chosen:** Build a personal audience or portfolio over time

Long-term reputation and writing practice matter more than any single post's traffic.

**Tradeoffs:** Slow payoff, but very low pressure and no real infrastructure demands.

**Alternatives not chosen:** Drive traffic and leads for a business; Keep existing users or customers informed with updates; Establish authority or expertise in a topic area

## How should posts be authored and the site built?

**Chosen:** Markdown files in a static site generator (e.g. Hugo, Eleventy, Jekyll)

Write posts as Markdown files in your code repo; the generator builds the site.

**Tradeoffs:** Free, fast, and versioned alongside your code, but writing requires comfort with Markdown and git — not friendly for non-technical co-authors.

**Alternatives not chosen:** Headless CMS (e.g. Contentful, Sanity) plus a static site generator; All-in-one blogging platform (e.g. WordPress, Ghost)

### What this means in practice

- **Deployment complexity:** Low. Write a Markdown file, commit, push — the host rebuilds and publishes.
- **Accounts & integrations to manage:** Git repository (e.g. GitHub); Hosting account; Domain registrar. Posts live in the repo; no separate content system.
- **Ballpark cost:** Free. Open-source tooling; you only pay for hosting and the domain.
- **Security concerns:** No admin login to attack — publishing access equals repo access, so protect the git account with 2FA.
- **Scalability:** High. Serves any traffic. Builds slow down past a few thousand posts on some generators (Hugo stays fast).
- **Governance, risk & compliance:** Full ownership of your content in plain files — no vendor lock-in or export problem. Check theme licenses.
- **Auditing for correctness:** Every post change is a git commit (full history). Add a link checker and an RSS validator to the build.
- **Staying on top of costs:** Nothing to monitor beyond the host's build minutes.
- **Performance:** Excellent — pre-rendered pages with little JavaScript.

## Where should this be hosted?

**Chosen:** GitHub Pages

Free static hosting straight from your repo — a natural fit for the Markdown/git approach.

**Tradeoffs:** Free and simple, but no built-in CMS webhook support if you later add a headless CMS.

**Alternatives not chosen:** Netlify; Vercel; Managed hosting for your platform (e.g. WordPress.com, Ghost(Pro))

### What this means in practice

- **Deployment complexity:** Low. Push to deploy; HTTPS and custom domains included.
- **Accounts & integrations to manage:** GitHub account; Domain registrar. Code, content, and hosting in one place.
- **Ballpark cost:** Free. Free for public repos.
- **Security concerns:** Free HTTPS; protect the GitHub account with 2FA. No custom security headers.
- **Scalability:** Medium. ~100 GB/month soft bandwidth limit — plenty for most personal blogs.
- **Governance, risk & compliance:** Not for commercial-transaction sites. Drafts in a public repo are publicly visible — keep drafts in a branch or a private repo.
- **Auditing for correctness:** Git history is your audit trail; the Actions log records each publish.
- **Staying on top of costs:** Nothing to monitor.
- **Performance:** Good: GitHub's CDN serves static files quickly.

## Do you want reader comments on posts?

**Chosen:** No comments

Skip comments entirely.

**Tradeoffs:** Zero moderation burden and stays fully static, but readers have no way to engage directly on the post.

**Alternatives not chosen:** Lightweight third-party comments (e.g. giscus, Disqus); Full custom comments (requires a backend and database)

### What this means in practice

- **Deployment complexity:** Low. Nothing to deploy.
- **Accounts & integrations to manage:** None. No extra accounts.
- **Ballpark cost:** Free. No cost.
- **Security concerns:** No user-generated content, so no spam or abuse to moderate.
- **Scalability:** High. Not applicable.
- **Governance, risk & compliance:** No reader data collected and no moderation obligations.
- **Auditing for correctness:** Nothing to audit.
- **Staying on top of costs:** Nothing to monitor.
- **Performance:** Best — no comment widget to load.

## Changes after the wizard

_Record any decision changed during spec/plan work here: what changed, why, and what it affects._
