# Constitution input — Site with a backend/database

Give this to `/speckit.constitution`, together with the answers to the budget, compliance,
sensitive-data, user-location, accessibility, and performance questions in `open-questions.md`.
These are the principles every spec, plan, and task must respect.

## 1. The architecture decisions are binding

- Who will use this site? → **Internal team or employees only**
- What's the main thing this site needs to do? → **Provide an admin tool for internal operations**
- What architecture style fits best? → **Separate frontend and API backend (two deployables)**
- Which database fits best? → **MongoDB (document)**
- How should users log in? → **Social login only (Google/GitHub/etc. via OAuth)**
- Where should this be hosted? → **Managed container platform (e.g. Render, Fly.io, Railway)**

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

- _Separate frontend and API backend (two deployables):_ CORS, token storage in the browser, and API auth all become explicit concerns. The API is publicly reachable — rate limiting matters.
- _MongoDB (document):_ Never run with auth disabled or open to the internet (a classic breach cause). Watch for NoSQL injection in query filters.
- _Social login only (Google/GitHub/etc. via OAuth):_ No passwords to store. Protect OAuth client secrets and validate the state parameter to prevent CSRF.
- _Managed container platform (e.g. Render, Fly.io, Railway):_ The platform patches the hosts; you keep your container image's dependencies updated.

## 7. Governance, risk & compliance

- _Separate frontend and API backend (two deployables):_ Two systems to document; make sure the API's logs don't capture personal data you didn't mean to keep.
- _MongoDB (document):_ Flexible schemas make it easy to store personal data you didn't intend to — define and validate document shapes.
- _Social login only (Google/GitHub/etc. via OAuth):_ Users without a Google/GitHub account can't sign in — an accessibility and reach issue. Request only the scopes you need.
- _Managed container platform (e.g. Render, Fly.io, Railway):_ Choose regions deliberately; check backup and data-retention options on the managed database.

## 8. Cost guardrails

Set a budget alert on every paid account at the monthly limit from `open-questions.md`.

- _Separate frontend and API backend (two deployables):_ Two bills — set alerts on both, especially API egress.
- _MongoDB (document):_ Watch the cluster tier — the jump from shared to dedicated is a big price step.
- _Social login only (Google/GitHub/etc. via OAuth):_ Nothing to monitor.
- _Managed container platform (e.g. Render, Fly.io, Railway):_ Usage-based with fixed-size instances — check the monthly estimate after each scaling change.

## 9. Auditing for correctness

- _Separate frontend and API backend (two deployables):_ Contract tests between frontend and API catch breaking changes; monitor both separately.
- _MongoDB (document):_ Use schema validation rules; cross-document consistency is easier to get wrong than with SQL joins and constraints.
- _Social login only (Google/GitHub/etc. via OAuth):_ Test each provider's login flow after any config change; log which provider each user came from.
- _Managed container platform (e.g. Render, Fly.io, Railway):_ Deploy history, health checks, and logs; add error monitoring.

## 10. Performance

- _Separate frontend and API backend (two deployables):_ Very fast page loads from the CDN; each data fetch adds an API round trip.
- _MongoDB (document):_ Very fast for reading whole documents; weaker for complex joins and reports.
- _Social login only (Google/GitHub/etc. via OAuth):_ Adds a redirect to the provider at login only.
- _Managed container platform (e.g. Render, Fly.io, Railway):_ Consistent, no cold starts on always-on instances.
