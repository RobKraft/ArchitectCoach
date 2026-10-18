# Constitution input — Site with a backend/database

Give this to `/speckit.constitution`, together with the answers to the budget, compliance,
sensitive-data, user-location, accessibility, and performance questions in `open-questions.md`.
These are the principles every spec, plan, and task must respect.

## 1. The architecture decisions are binding

- Who will use this site? → **General public / consumers**
- What's the main thing this site needs to do? → **Let users create accounts and manage their own data**
- What architecture style fits best? → **Monolith — one deployable app for everything**
- Which database fits best? → **PostgreSQL (relational)**
- How should users log in? → **Email and password, handled yourself**
- Where should this be hosted? → **Vercel or Netlify (serverless-friendly platforms)**

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

- _Monolith — one deployable app for everything:_ One codebase to secure and one place to apply auth — simplest to reason about. A single vulnerability can expose everything.
- _PostgreSQL (relational):_ Never expose the database publicly; use a least-privilege app user, TLS, and parameterized queries (or an ORM) against SQL injection.
- _Email and password, handled yourself:_ Highest risk: password hashing (argon2/bcrypt), session handling, brute-force protection, reset-token flows, and MFA are all on you.
- _Vercel or Netlify (serverless-friendly platforms):_ No servers to patch. Keep secrets in the platform's environment variables, never in client code.

## 7. Governance, risk & compliance

- _Monolith — one deployable app for everything:_ Easy to document and audit: one system, one data flow. Access control lives in one place.
- _PostgreSQL (relational):_ Choose the provider's region for data residency; encryption at rest is standard on managed services. Define a backup retention period.
- _Email and password, handled yourself:_ You hold credentials — a breach is a notifiable incident in most jurisdictions. Needs a documented security process.
- _Vercel or Netlify (serverless-friendly platforms):_ Pick function regions near your database and users; sign each vendor's DPA.

## 8. Cost guardrails

Set a budget alert on every paid account at the monthly limit from `open-questions.md`.

- _Monolith — one deployable app for everything:_ One bill per component; set a billing alert on the hosting account.
- _PostgreSQL (relational):_ Watch storage growth and compute hours on serverless plans; set billing alerts.
- _Email and password, handled yourself:_ Watch email-sending volume — a bot hammering sign-up or reset can drive it up.
- _Vercel or Netlify (serverless-friendly platforms):_ Set a spend cap — function invocations and bandwidth are usage-billed.

## 9. Auditing for correctness

- _Monolith — one deployable app for everything:_ One test suite and one log stream; add request logging and error monitoring (e.g. Sentry) from day one.
- _PostgreSQL (relational):_ Database constraints catch bad data; run migrations in CI against a real Postgres; test restoring a backup.
- _Email and password, handled yourself:_ Log every login, failure, and password reset; test the reset flow end to end; get a security review before launch.
- _Vercel or Netlify (serverless-friendly platforms):_ Deploy previews, function logs, and instant rollback; add error monitoring.

## 10. Performance

- _Monolith — one deployable app for everything:_ Fast: in-process function calls with no network hops between parts.
- _PostgreSQL (relational):_ Excellent for relational queries with the right indexes; use EXPLAIN on slow queries.
- _Email and password, handled yourself:_ Fast; password hashing is deliberately slow (~100 ms) — that's expected.
- _Vercel or Netlify (serverless-friendly platforms):_ Fast static pages; functions can have cold starts of a few hundred milliseconds.
