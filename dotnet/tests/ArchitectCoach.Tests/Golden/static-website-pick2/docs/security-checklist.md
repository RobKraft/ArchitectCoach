# Security checklist

## 1. Data sensitivity posture

This is a static site with no login, no user accounts, and no database — the threat model
here is much smaller than a typical web app. Google Analytics is enabled. It collects visitor data (IP-derived location, device info, behavior) — check whether your audience's jurisdiction (e.g. EU/UK) requires a cookie-consent banner or a published privacy policy before it goes live.

## Secrets

- Deploy credentials for Vercel (an API token or deploy key) live in your CI provider's
  encrypted secrets (e.g. GitHub Actions secrets), never committed to the repo.
- If a third-party form service is ever added, its API key is a secret too — same rule.

## Third-party data exposure

- Google Analytics

## Injection / untrusted input

Not applicable — this project has no backend or database to inject into. If a contact form is
added that posts anywhere other than a trusted third-party form service, revisit this section.

## Network exposure

- Auth: none — the site is intentionally fully public.
- HTTPS: Vercel provides this automatically for a custom domain; don't disable it.
- CORS: not applicable — this project has no API of its own.

## Dependencies

Run `npm audit` (or the build tool's equivalent) periodically. A compromised build-time dependency can't reach visitors directly, but it could inject something into the site output during a build.

## Reporting a concern

No formal process yet — small project, no external users. Add contact info here once that's
no longer true.
