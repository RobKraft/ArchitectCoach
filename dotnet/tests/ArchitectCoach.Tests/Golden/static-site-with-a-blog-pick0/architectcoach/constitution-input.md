# Constitution input — Static site with a blog

Give this to `/speckit.constitution`, together with the answers to the budget, compliance,
sensitive-data, user-location, accessibility, and performance questions in `open-questions.md`.
These are the principles every spec, plan, and task must respect.

## 1. The architecture decisions are binding

- Who is this blog for? → **Personal audience — writing under your own name**
- What's the main goal for the blog? → **Build a personal audience or portfolio over time**
- How should posts be authored and the site built? → **Markdown files in a static site generator (e.g. Hugo, Eleventy, Jekyll)**
- Where should this be hosted? → **GitHub Pages**
- Do you want reader comments on posts? → **No comments**

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

- _Markdown files in a static site generator (e.g. Hugo, Eleventy, Jekyll):_ No admin login to attack — publishing access equals repo access, so protect the git account with 2FA.
- _GitHub Pages:_ Free HTTPS; protect the GitHub account with 2FA. No custom security headers.
- _No comments:_ No user-generated content, so no spam or abuse to moderate.

## 7. Governance, risk & compliance

- _Markdown files in a static site generator (e.g. Hugo, Eleventy, Jekyll):_ Full ownership of your content in plain files — no vendor lock-in or export problem. Check theme licenses.
- _GitHub Pages:_ Not for commercial-transaction sites. Drafts in a public repo are publicly visible — keep drafts in a branch or a private repo.
- _No comments:_ No reader data collected and no moderation obligations.

## 8. Cost guardrails

Set a budget alert on every paid account at the monthly limit from `open-questions.md`.

- _Markdown files in a static site generator (e.g. Hugo, Eleventy, Jekyll):_ Nothing to monitor beyond the host's build minutes.
- _GitHub Pages:_ Nothing to monitor.
- _No comments:_ Nothing to monitor.

## 9. Auditing for correctness

- _Markdown files in a static site generator (e.g. Hugo, Eleventy, Jekyll):_ Every post change is a git commit (full history). Add a link checker and an RSS validator to the build.
- _GitHub Pages:_ Git history is your audit trail; the Actions log records each publish.
- _No comments:_ Nothing to audit.

## 10. Performance

- _Markdown files in a static site generator (e.g. Hugo, Eleventy, Jekyll):_ Excellent — pre-rendered pages with little JavaScript.
- _GitHub Pages:_ Good: GitHub's CDN serves static files quickly.
- _No comments:_ Best — no comment widget to load.
