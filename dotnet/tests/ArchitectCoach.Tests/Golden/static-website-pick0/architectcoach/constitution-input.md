# Constitution input — Static website

Give this to `/speckit.constitution`, together with the answers to the budget, compliance,
sensitive-data, user-location, accessibility, and performance questions in `open-questions.md`.
These are the principles every spec, plan, and task must respect.

## 1. The architecture decisions are binding

- Who is this static website for? → **Personal portfolio or blog**
- What's the main goal for this site? → **Get discovered through search and attract visitors organically**
- How should this site be built? → **Plain HTML, CSS, and JavaScript**
- Where should this site be hosted? → **GitHub Pages**
- Do you need visitor analytics? → **No analytics needed**

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

- _Plain HTML, CSS, and JavaScript:_ Smallest possible attack surface: no server code, no dependencies to patch. Main risks are leaked hosting credentials and any third-party scripts you paste in.
- _GitHub Pages:_ Free HTTPS. Turn on 2FA for GitHub — whoever controls the repo controls the site. No custom security headers (e.g. CSP) are possible.
- _No analytics needed:_ No third-party script on your pages — nothing that could be compromised to inject code.

## 7. Governance, risk & compliance

- _Plain HTML, CSS, and JavaScript:_ Few concerns. Add a privacy notice if you add analytics or forms, and keep license notices for any copied CSS/JS.
- _GitHub Pages:_ GitHub's terms discourage using Pages mainly for commercial transactions. Content in a public repo is visible to everyone.
- _No analytics needed:_ Simplest compliance position: no tracking, no cookie banner needed for analytics.

## 8. Cost guardrails

Set a budget alert on every paid account at the monthly limit from `open-questions.md`.

- _Plain HTML, CSS, and JavaScript:_ Nothing to monitor here — the cost lives with the hosting choice.
- _GitHub Pages:_ Nothing to monitor — no usage billing.
- _No analytics needed:_ Nothing to monitor.

## 9. Auditing for correctness

- _Plain HTML, CSS, and JavaScript:_ Run an HTML validator and a broken-link checker before each upload; check pages with Lighthouse for accessibility.
- _GitHub Pages:_ The Actions log shows each deploy; every change is a git commit, so you get a full audit trail automatically.
- _No analytics needed:_ Your host may still show basic request counts if you need a rough sense of traffic.

## 10. Performance

- _Plain HTML, CSS, and JavaScript:_ Excellent by default: no framework JavaScript to download. Optimize images and you'll score near-perfect.
- _GitHub Pages:_ Good: served from GitHub's CDN. Less control over caching than Netlify/Vercel.
- _No analytics needed:_ Best possible — no extra script to load.
