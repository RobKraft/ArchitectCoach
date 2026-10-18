# Constitution input — Static site with a blog

Give this to `/speckit.constitution`, together with the answers to the budget, compliance,
sensitive-data, user-location, accessibility, and performance questions in `open-questions.md`.
These are the principles every spec, plan, and task must respect.

## 1. The architecture decisions are binding

- Who is this blog for? → **Company or product blog for marketing/SEO**
- What's the main goal for the blog? → **Drive traffic and leads for a business**
- How should posts be authored and the site built? → **Headless CMS (e.g. Contentful, Sanity) plus a static site generator**
- Where should this be hosted? → **Netlify**
- Do you want reader comments on posts? → **Lightweight third-party comments (e.g. giscus, Disqus)**

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

- _Headless CMS (e.g. Contentful, Sanity) plus a static site generator:_ CMS API tokens must stay server/build-side only. Writers' CMS accounts need 2FA and the least access they need.
- _Netlify:_ Free HTTPS and configurable security headers.
- _Lightweight third-party comments (e.g. giscus, Disqus):_ Spam and abuse moderation become your job. The embed is a third-party script on your pages.

## 7. Governance, risk & compliance

- _Headless CMS (e.g. Contentful, Sanity) plus a static site generator:_ Content lives in a vendor's database — check export options and where the data is hosted. Your writers' accounts are personal data held by the vendor.
- _Netlify:_ Check the DPA for EU readers, especially if you use Netlify Forms to collect emails.
- _Lightweight third-party comments (e.g. giscus, Disqus):_ Disqus's free tier serves ads and tracks readers — needs consent handling in the EU. giscus stores comments publicly on GitHub.

## 8. Cost guardrails

Set a budget alert on every paid account at the monthly limit from `open-questions.md`.

- _Headless CMS (e.g. Contentful, Sanity) plus a static site generator:_ Watch seat count, API calls, and asset bandwidth against the free tier's limits.
- _Netlify:_ Set usage notifications — a viral post can exhaust free bandwidth.
- _Lightweight third-party comments (e.g. giscus, Disqus):_ Free tiers usually stay free; watch for changes to Disqus's plans.

## 9. Auditing for correctness

- _Headless CMS (e.g. Contentful, Sanity) plus a static site generator:_ CMS version history shows who changed what; check that the publish webhook actually triggers a rebuild (failed builds are easy to miss).
- _Netlify:_ Deploy log and one-click rollback.
- _Lightweight third-party comments (e.g. giscus, Disqus):_ Check moderation queues regularly; make sure comments load on a sample of old posts after theme changes.

## 10. Performance

- _Headless CMS (e.g. Contentful, Sanity) plus a static site generator:_ Excellent for readers (static output). Builds take longer because they fetch content over the API.
- _Netlify:_ Excellent.
- _Lightweight third-party comments (e.g. giscus, Disqus):_ giscus is light; Disqus adds noticeable weight from ads and trackers. Lazy-load either below the fold.
