# Decisions already made — Site with a backend/database

Made in ArchitectCoach's wizard. Treat these as settled (see AGENTS.md, rule 1).
Cost figures are rough monthly ballparks as of October 2026; check current vendor pricing.

**Purpose:** Project 2 purpose

## Who will use this site?

**Chosen:** General public / consumers

Anyone can sign up and use the product; no vetting or approval process.

**Tradeoffs:** Widest reach, but also the most exposure to spam/abuse signups and the highest scale uncertainty.

**Alternatives not chosen:** Paying customers (subscription or e-commerce); Internal team or employees only; Other businesses (B2B) via login

## What's the main thing this site needs to do?

**Chosen:** Let users create accounts and manage their own data

The core loop is: sign up, store personal data, come back and manage it.

**Tradeoffs:** Straightforward CRUD-shaped app — a very well-trodden path with lots of tooling support.

**Alternatives not chosen:** Process payments or transactions; Provide an admin tool for internal operations; Aggregate or display data from other systems

## What architecture style fits best?

**Chosen:** Monolith — one deployable app for everything

Frontend, backend, and database all part of a single application you deploy as one unit.

**Tradeoffs:** Fastest to build and simplest to operate for most new projects, but everything scales and deploys together, which becomes a real limit only at meaningful scale.

**Alternatives not chosen:** Modular monolith — one deployable, cleanly separated internal modules; Separate frontend and API backend (two deployables); Microservices — multiple independently deployable services

### What this means in practice

- **Deployment complexity:** Low. One app, one build, one deploy. Rollback means redeploying the previous version.
- **Accounts & integrations to manage:** App hosting; Database; Domain registrar. The smallest set of moving parts.
- **Ballpark cost:** ~$10/mo. One small app instance plus a small database; free tiers can cover early use.
- **Security concerns:** One codebase to secure and one place to apply auth — simplest to reason about. A single vulnerability can expose everything.
- **Scalability:** Medium. Scales well by adding instances behind a load balancer; scaling individual features separately isn't possible.
- **Governance, risk & compliance:** Easy to document and audit: one system, one data flow. Access control lives in one place.
- **Auditing for correctness:** One test suite and one log stream; add request logging and error monitoring (e.g. Sentry) from day one.
- **Staying on top of costs:** One bill per component; set a billing alert on the hosting account.
- **Performance:** Fast: in-process function calls with no network hops between parts.

## Which database fits best?

**Chosen:** PostgreSQL (relational)

A mature, fully-featured relational database.

**Tradeoffs:** Excellent default for most apps with structured, related data — the tradeoff is mostly upfront schema design discipline.

**Alternatives not chosen:** MySQL (relational); MongoDB (document); SQLite (simple file-based)

### What this means in practice

- **Deployment complexity:** Medium. Use a managed provider (Neon, Supabase, RDS, Azure) and run migrations as part of each deploy.
- **Accounts & integrations to manage:** Managed Postgres provider. Plus backup settings and a migration tool (e.g. Prisma, Flyway).
- **Ballpark cost:** ~$10/mo. Free tiers exist (Neon, Supabase); small paid instances ~$5–25/mo.
- **Security concerns:** Never expose the database publicly; use a least-privilege app user, TLS, and parameterized queries (or an ORM) against SQL injection.
- **Scalability:** High. Handles far more than most apps need; read replicas and connection pooling come next.
- **Governance, risk & compliance:** Choose the provider's region for data residency; encryption at rest is standard on managed services. Define a backup retention period.
- **Auditing for correctness:** Database constraints catch bad data; run migrations in CI against a real Postgres; test restoring a backup.
- **Staying on top of costs:** Watch storage growth and compute hours on serverless plans; set billing alerts.
- **Performance:** Excellent for relational queries with the right indexes; use EXPLAIN on slow queries.

## How should users log in?

**Chosen:** Email and password, handled yourself

You build and store your own login system.

**Tradeoffs:** Full control, but you own password storage security, reset flows, and every edge case — real risk if done casually.

**Alternatives not chosen:** Managed auth provider (e.g. Auth0, Clerk, Supabase Auth); Social login only (Google/GitHub/etc. via OAuth); No authentication needed yet

### What this means in practice

- **Deployment complexity:** Medium. You build sign-up, login, password reset, and email verification — plus an email-sending service.
- **Accounts & integrations to manage:** Transactional email service (e.g. Postmark, SendGrid, Resend). Users and password hashes live in your own database.
- **Ballpark cost:** Free. Email services are free or ~$1–15/mo at low volume. The real cost is development and maintenance time.
- **Security concerns:** Highest risk: password hashing (argon2/bcrypt), session handling, brute-force protection, reset-token flows, and MFA are all on you.
- **Scalability:** High. Scales with your database; no per-user vendor fees.
- **Governance, risk & compliance:** You hold credentials — a breach is a notifiable incident in most jurisdictions. Needs a documented security process.
- **Auditing for correctness:** Log every login, failure, and password reset; test the reset flow end to end; get a security review before launch.
- **Staying on top of costs:** Watch email-sending volume — a bot hammering sign-up or reset can drive it up.
- **Performance:** Fast; password hashing is deliberately slow (~100 ms) — that's expected.

## Where should this be hosted?

**Chosen:** Vercel or Netlify (serverless-friendly platforms)

Deploy-by-git platforms built around serverless functions and static assets.

**Tradeoffs:** Very fast to deploy and scales automatically, but serverless function limits (execution time, cold starts) can be a poor fit for long-running backend work.

**Alternatives not chosen:** Traditional cloud VM (AWS EC2, DigitalOcean Droplet, etc.); Managed container platform (e.g. Render, Fly.io, Railway); A major cloud provider's full platform (AWS/Azure/GCP)

### What this means in practice

- **Deployment complexity:** Low. Git-push deploys with previews; backend code runs as serverless functions.
- **Accounts & integrations to manage:** Vercel/Netlify account; Separate database provider; Domain registrar. The database almost always comes from another vendor.
- **Ballpark cost:** ~$10/mo. Free to start; commercial use needs Pro (~$20/member/mo), plus the database.
- **Security concerns:** No servers to patch. Keep secrets in the platform's environment variables, never in client code.
- **Scalability:** High. Scales automatically. Watch database connection limits — many function instances can exhaust them (use pooling).
- **Governance, risk & compliance:** Pick function regions near your database and users; sign each vendor's DPA.
- **Auditing for correctness:** Deploy previews, function logs, and instant rollback; add error monitoring.
- **Staying on top of costs:** Set a spend cap — function invocations and bandwidth are usage-billed.
- **Performance:** Fast static pages; functions can have cold starts of a few hundred milliseconds.

## Changes after the wizard

_Record any decision changed during spec/plan work here: what changed, why, and what it affects._
