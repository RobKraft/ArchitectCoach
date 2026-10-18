# Decisions already made — Site with a backend/database

Made in ArchitectCoach's wizard. Treat these as settled (see AGENTS.md, rule 1).
Cost figures are rough monthly ballparks as of October 2026; check current vendor pricing.

**Purpose:** _Not stated — ask the developer._

## Who will use this site?

**Chosen:** Internal team or employees only

A tool used only inside your own organization.

**Tradeoffs:** Much lower security/scale pressure, and login can often piggyback on existing company accounts (SSO) instead of building your own.

**Alternatives not chosen:** General public / consumers; Paying customers (subscription or e-commerce); Other businesses (B2B) via login

## What's the main thing this site needs to do?

**Chosen:** Provide an admin tool for internal operations

Primarily a back-office tool for staff to view and manage data, not a public-facing product.

**Tradeoffs:** Lower design/polish pressure, but still needs solid access control since it touches real operational data.

**Alternatives not chosen:** Let users create accounts and manage their own data; Process payments or transactions; Aggregate or display data from other systems

## What architecture style fits best?

**Chosen:** Separate frontend and API backend (two deployables)

A frontend app and a backend API deployed and scaled independently.

**Tradeoffs:** Lets frontend and backend evolve and scale somewhat independently, at the cost of running and coordinating two deployments instead of one.

**Alternatives not chosen:** Monolith — one deployable app for everything; Modular monolith — one deployable, cleanly separated internal modules; Microservices — multiple independently deployable services

### What this means in practice

- **Deployment complexity:** Medium. Two deployables that must stay compatible; API changes need versioning or coordinated releases.
- **Accounts & integrations to manage:** Frontend hosting; API hosting; Database; Domain registrar (plus DNS for api.* subdomain). Also CORS settings and an API base URL per environment.
- **Ballpark cost:** ~$10/mo. Frontend is often free on a static host; the API and database are ~$5–25/mo.
- **Security concerns:** CORS, token storage in the browser, and API auth all become explicit concerns. The API is publicly reachable — rate limiting matters.
- **Scalability:** High. Frontend scales on a CDN for free; the API scales independently.
- **Governance, risk & compliance:** Two systems to document; make sure the API's logs don't capture personal data you didn't mean to keep.
- **Auditing for correctness:** Contract tests between frontend and API catch breaking changes; monitor both separately.
- **Staying on top of costs:** Two bills — set alerts on both, especially API egress.
- **Performance:** Very fast page loads from the CDN; each data fetch adds an API round trip.

## Which database fits best?

**Chosen:** MongoDB (document)

A document database storing flexible, JSON-like records instead of fixed tables.

**Tradeoffs:** Schema flexibility is convenient early on, but relational queries across documents are harder, and weaker default consistency guarantees can surprise you later.

**Alternatives not chosen:** PostgreSQL (relational); MySQL (relational); SQLite (simple file-based)

### What this means in practice

- **Deployment complexity:** Medium. Usually MongoDB Atlas; no schema migrations, but data-shape changes still need scripts.
- **Accounts & integrations to manage:** MongoDB Atlas (or another host). Plus IP allow-listing and backup settings.
- **Ballpark cost:** ~$10/mo. Free shared cluster for development; dedicated clusters start around $50/mo.
- **Security concerns:** Never run with auth disabled or open to the internet (a classic breach cause). Watch for NoSQL injection in query filters.
- **Scalability:** High. Scales horizontally with sharding; best when data is naturally document-shaped.
- **Governance, risk & compliance:** Flexible schemas make it easy to store personal data you didn't intend to — define and validate document shapes.
- **Auditing for correctness:** Use schema validation rules; cross-document consistency is easier to get wrong than with SQL joins and constraints.
- **Staying on top of costs:** Watch the cluster tier — the jump from shared to dedicated is a big price step.
- **Performance:** Very fast for reading whole documents; weaker for complex joins and reports.

## How should users log in?

**Chosen:** Social login only (Google/GitHub/etc. via OAuth)

Users sign in with an existing account from another provider — no passwords of your own.

**Tradeoffs:** No password storage risk at all, but you're fully dependent on those providers and it excludes users who don't have (or don't want to use) those accounts.

**Alternatives not chosen:** Email and password, handled yourself; Managed auth provider (e.g. Auth0, Clerk, Supabase Auth); No authentication needed yet

### What this means in practice

- **Deployment complexity:** Low. Register an OAuth app with each provider and configure callback URLs per environment.
- **Accounts & integrations to manage:** Developer accounts with each provider (Google, GitHub, etc.). One OAuth client and secret per provider per environment.
- **Ballpark cost:** Free. Free.
- **Security concerns:** No passwords to store. Protect OAuth client secrets and validate the state parameter to prevent CSRF.
- **Scalability:** High. No scaling concern.
- **Governance, risk & compliance:** Users without a Google/GitHub account can't sign in — an accessibility and reach issue. Request only the scopes you need.
- **Auditing for correctness:** Test each provider's login flow after any config change; log which provider each user came from.
- **Staying on top of costs:** Nothing to monitor.
- **Performance:** Adds a redirect to the provider at login only.

## Where should this be hosted?

**Chosen:** Managed container platform (e.g. Render, Fly.io, Railway)

Deploy a container without managing the underlying servers yourself.

**Tradeoffs:** A good middle ground — much less infrastructure work than a raw VM, with fewer of the runtime limits of a pure serverless platform.

**Alternatives not chosen:** Vercel or Netlify (serverless-friendly platforms); Traditional cloud VM (AWS EC2, DigitalOcean Droplet, etc.); A major cloud provider's full platform (AWS/Azure/GCP)

### What this means in practice

- **Deployment complexity:** Medium. Push code or a Dockerfile; the platform builds and runs it, with TLS and health checks included.
- **Accounts & integrations to manage:** Container platform account; Database (often same platform); Domain registrar. Often one vendor for app and database.
- **Ballpark cost:** ~$10/mo. ~$5–25/mo for a small always-on app plus database.
- **Security concerns:** The platform patches the hosts; you keep your container image's dependencies updated.
- **Scalability:** High. Add instances or regions from the dashboard.
- **Governance, risk & compliance:** Choose regions deliberately; check backup and data-retention options on the managed database.
- **Auditing for correctness:** Deploy history, health checks, and logs; add error monitoring.
- **Staying on top of costs:** Usage-based with fixed-size instances — check the monthly estimate after each scaling change.
- **Performance:** Consistent, no cold starts on always-on instances.

## Changes after the wizard

_Record any decision changed during spec/plan work here: what changed, why, and what it affects._
