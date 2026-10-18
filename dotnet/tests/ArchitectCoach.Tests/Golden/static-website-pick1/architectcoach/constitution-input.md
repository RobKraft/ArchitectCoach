# Constitution input — Static website

Give this to `/speckit.constitution`, together with the answers to the budget, compliance,
sensitive-data, user-location, accessibility, and performance questions in `open-questions.md`.
These are the principles every spec, plan, and task must respect.

## 1. The architecture decisions are binding

- Who is this static website for? → **Business or organization marketing site**
- What's the main goal for this site? → **Convert visitors into leads or customers**
- How should this site be built? → **Static site generator (e.g. Eleventy, Hugo, Jekyll)**
- Where should this site be hosted? → **Netlify**
- Do you need visitor analytics? → **Privacy-friendly analytics (e.g. Plausible, Fathom)**

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

- _Static site generator (e.g. Eleventy, Hugo, Jekyll):_ Output is still plain files, so the live site has almost nothing to attack. Build-time npm/gem dependencies can carry supply-chain risk — pin versions and use Dependabot.
- _Netlify:_ Free HTTPS, configurable security headers, and password-protected deploy previews on paid plans.
- _Privacy-friendly analytics (e.g. Plausible, Fathom):_ A third-party script runs on every page. Choose a reputable vendor and consider loading it through your own domain.

## 7. Governance, risk & compliance

- _Static site generator (e.g. Eleventy, Hugo, Jekyll):_ Check the theme's license if you use one. Same privacy-notice needs as any site that adds analytics or forms.
- _Netlify:_ Netlify is a US company; check its DPA if visitors are in the EU. Free-tier usage is subject to fair-use terms.
- _Privacy-friendly analytics (e.g. Plausible, Fathom):_ Cookie-free and designed to need no consent banner under GDPR. Still mention it in your privacy notice.

## 8. Cost guardrails

Set a budget alert on every paid account at the monthly limit from `open-questions.md`.

- _Static site generator (e.g. Eleventy, Hugo, Jekyll):_ Watch the host's build-minute usage if you rebuild very often; otherwise nothing.
- _Netlify:_ Set usage notifications in team settings — overages (bandwidth, form submissions, function calls) are where surprise bills come from.
- _Privacy-friendly analytics (e.g. Plausible, Fathom):_ Plans are pageview tiers — check usage monthly so a traffic spike doesn't bump you up a tier unexpectedly.

## 9. Auditing for correctness

- _Static site generator (e.g. Eleventy, Hugo, Jekyll):_ Fail the build on broken internal links (most generators have a plugin), and use the host's deploy previews to review changes before they go live.
- _Netlify:_ Deploy log and one-click rollback to any previous deploy; deploy previews let someone review before merging.
- _Privacy-friendly analytics (e.g. Plausible, Fathom):_ Compare its numbers against your host's request logs occasionally; set up goal tracking to confirm events fire.

## 10. Performance

- _Static site generator (e.g. Eleventy, Hugo, Jekyll):_ Excellent — output is pre-rendered HTML with little or no JavaScript.
- _Netlify:_ Excellent for static files; fast global CDN with sensible cache defaults.
- _Privacy-friendly analytics (e.g. Plausible, Fathom):_ Negligible impact: the script is under ~1 KB.
