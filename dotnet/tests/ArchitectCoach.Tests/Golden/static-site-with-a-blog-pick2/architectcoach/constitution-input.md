# Constitution input — Static site with a blog

Give this to `/speckit.constitution`, together with the answers to the budget, compliance,
sensitive-data, user-location, accessibility, and performance questions in `open-questions.md`.
These are the principles every spec, plan, and task must respect.

## 1. The architecture decisions are binding

- Who is this blog for? → **Team or engineering blog sharing technical updates**
- What's the main goal for the blog? → **Keep existing users or customers informed with updates**
- How should posts be authored and the site built? → **All-in-one blogging platform (e.g. WordPress, Ghost)**
- Where should this be hosted? → **Vercel**
- Do you want reader comments on posts? → **Full custom comments (requires a backend and database)**

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

- _All-in-one blogging platform (e.g. WordPress, Ghost):_ WordPress is the most-attacked platform on the web: plugins and its admin login need constant updates and hardening. Ghost has a smaller attack surface.
- _Vercel:_ Free HTTPS, configurable headers, deployment protection.
- _Full custom comments (requires a backend and database):_ You own input sanitization (XSS), spam, rate limiting, auth, and protecting stored emails. This is the riskiest option.

## 7. Governance, risk & compliance

- _All-in-one blogging platform (e.g. WordPress, Ghost):_ Comments, newsletters, and member signups collect personal data — needs a privacy policy and data-deletion process. Plugin licenses vary.
- _Vercel:_ Ads, sponsorships, or paid content count as commercial — that rules out the Hobby plan.
- _Full custom comments (requires a backend and database):_ You become the data controller for reader names and emails: privacy policy, deletion requests, and possibly content-moderation obligations.

## 8. Cost guardrails

Set a budget alert on every paid account at the monthly limit from `open-questions.md`.

- _All-in-one blogging platform (e.g. WordPress, Ghost):_ Watch renewal pricing and how plugin subscriptions add up; set billing alerts if self-hosting.
- _Vercel:_ Set a spend cap on Pro.
- _Full custom comments (requires a backend and database):_ Billing alerts on the database and functions; spam bots can drive up usage-based costs.

## 9. Auditing for correctness

- _All-in-one blogging platform (e.g. WordPress, Ghost):_ Turn on automatic security updates, use an activity-log plugin, and test backups by actually restoring one.
- _Vercel:_ Deployment history with instant rollback.
- _Full custom comments (requires a backend and database):_ Needs automated tests for the API, error monitoring, and checked database backups.

## 10. Performance

- _All-in-one blogging platform (e.g. WordPress, Ghost):_ Good with caching, slow without it. Heavy themes and plugins are the usual cause of slowness.
- _Vercel:_ Excellent.
- _Full custom comments (requires a backend and database):_ Depends on implementation; load comments asynchronously so they don't slow the page itself.
