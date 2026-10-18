# Decisions already made — Site with a backend/database

Made in ArchitectCoach's wizard. Treat these as settled (see AGENTS.md, rule 1).
Cost figures are rough monthly ballparks as of October 2026; check current vendor pricing.

**Purpose:** Team's "booking" site & admin <beta>

## Who will use this site?

**Chosen:** Paying customers (subscription or e-commerce)

Access is tied to payment — a subscription, a purchase, or both.

**Tradeoffs:** Adds real payment-processing and billing complexity, but users are inherently more invested and easier to support.

**Alternatives not chosen:** General public / consumers; Internal team or employees only; Other businesses (B2B) via login

## What's the main thing this site needs to do?

**Chosen:** Process payments or transactions

Money moves through the system — purchases, subscriptions, or payouts.

**Tradeoffs:** Brings in real compliance and security obligations (PCI scope) even if you use a payment provider to avoid handling card data directly.

**Alternatives not chosen:** Let users create accounts and manage their own data; Provide an admin tool for internal operations; Aggregate or display data from other systems

## What architecture style fits best?

**Chosen:** Modular monolith — one deployable, cleanly separated internal modules

Still one deployable, but organized into well-bounded modules as if they might be split out later.

**Tradeoffs:** More upfront design discipline than a plain monolith, in exchange for an easier path to splitting things out later if you ever need to.

**Alternatives not chosen:** Monolith — one deployable app for everything; Separate frontend and API backend (two deployables); Microservices — multiple independently deployable services

### What this means in practice

- **Deployment complexity:** Low. Deploys exactly like a monolith; the module boundaries are code organization, not infrastructure.
- **Accounts & integrations to manage:** App hosting; Database; Domain registrar. The smallest set of moving parts — module boundaries add no infrastructure.
- **Ballpark cost:** ~$10/mo. One small app instance plus a small database; free tiers can cover early use.
- **Security concerns:** One codebase and one place to apply auth, plus clearer ownership of which module touches which data. A single vulnerability can still expose everything.
- **Scalability:** Medium. Scales like a monolith now, and a module can be pulled out into its own service later if it really needs to.
- **Governance, risk & compliance:** Module boundaries make it easier to show which code touches sensitive data.
- **Auditing for correctness:** Add architecture tests (e.g. dependency rules) so modules can't quietly reach into each other.
- **Staying on top of costs:** One bill per component; set a billing alert on the hosting account.
- **Performance:** Fast: modules call each other in-process, with no network hops.

## Which database fits best?

**Chosen:** MySQL (relational)

Another mature, widely-supported relational database.

**Tradeoffs:** Very similar tradeoffs to PostgreSQL; mainly worth picking over it for existing team familiarity or a hosting platform that favors it.

**Alternatives not chosen:** PostgreSQL (relational); MongoDB (document); SQLite (simple file-based)

### What this means in practice

- **Deployment complexity:** Medium. Use a managed provider (PlanetScale, RDS, Azure) and run migrations as part of each deploy.
- **Accounts & integrations to manage:** Managed MySQL provider (e.g. PlanetScale, RDS, Azure). Plus backups and a migration tool.
- **Ballpark cost:** ~$10/mo. Small managed instances ~$5–25/mo; free tiers are rarer than for Postgres.
- **Security concerns:** Never expose the database publicly; use a least-privilege app user, TLS, and parameterized queries (or an ORM) against SQL injection.
- **Scalability:** High. Proven at very large scale; read replicas are mature.
- **Governance, risk & compliance:** Choose the provider's region for data residency, confirm encryption at rest, define a backup retention period, and check the vendor's compliance certifications.
- **Auditing for correctness:** Use strict SQL mode so bad data errors instead of silently converting; test migrations and restores.
- **Staying on top of costs:** Watch storage and instance size; set billing alerts.
- **Performance:** Excellent for typical web workloads.

## How should users log in?

**Chosen:** Managed auth provider (e.g. Auth0, Clerk, Supabase Auth)

A dedicated service handles signup, login, sessions, and security for you.

**Tradeoffs:** Offloads the hardest security work to specialists, at the cost of a recurring bill and a dependency on their uptime.

**Alternatives not chosen:** Email and password, handled yourself; Social login only (Google/GitHub/etc. via OAuth); No authentication needed yet

### What this means in practice

- **Deployment complexity:** Low. Install an SDK, configure redirect URLs per environment, and add login pages from the vendor.
- **Accounts & integrations to manage:** Auth provider (e.g. Auth0, Clerk, Supabase Auth). Separate configuration for development and production.
- **Ballpark cost:** Free. Free up to ~10,000–25,000 monthly active users; paid tiers often jump to $25–$100+/mo, and SSO features cost more.
- **Security concerns:** The vendor handles password storage, MFA, and breach detection — usually much safer than DIY. You still must verify tokens correctly on the server.
- **Scalability:** High. Scales with the vendor; pricing, not technology, is the limit.
- **Governance, risk & compliance:** The vendor processes user personal data — sign their DPA; most hold SOC 2 / ISO 27001, which helps your own compliance.
- **Auditing for correctness:** Use the vendor's login logs and anomaly alerts; write tests for your token verification and role checks.
- **Staying on top of costs:** Track monthly active users against the free tier threshold — growth can trigger a sudden plan jump.
- **Performance:** Adds a redirect at login; nothing on normal requests if tokens are verified locally.

## Where should this be hosted?

**Chosen:** Traditional cloud VM (AWS EC2, DigitalOcean Droplet, etc.)

A virtual machine you configure and manage yourself.

**Tradeoffs:** Maximum control and no platform limits, but you own OS updates, scaling, and uptime yourself.

**Alternatives not chosen:** Vercel or Netlify (serverless-friendly platforms); Managed container platform (e.g. Render, Fly.io, Railway); A major cloud provider's full platform (AWS/Azure/GCP)

### What this means in practice

- **Deployment complexity:** High. You set up the OS, runtime, reverse proxy, TLS, process manager, and a deploy script.
- **Accounts & integrations to manage:** Cloud provider account; Domain registrar; Backup solution. You also own OS updates and monitoring.
- **Ballpark cost:** ~$10/mo. A small VM ~$5–20/mo — cheap, predictable, and you can run the database on it too.
- **Security concerns:** You patch the OS, configure the firewall, harden SSH, and renew certificates. Easy to fall behind.
- **Scalability:** Medium. Scale up by resizing; scaling out needs a load balancer and more manual setup.
- **Governance, risk & compliance:** Full control of the data's location, but also full responsibility for patching and backups.
- **Auditing for correctness:** Keep server configuration in scripts (not hand edits); add uptime and disk monitoring.
- **Staying on top of costs:** Fixed price — but snapshots, extra disks, and bandwidth overages add line items.
- **Performance:** Consistent, no cold starts; limited to one region unless you add a CDN.

## Changes after the wizard

_Record any decision changed during spec/plan work here: what changed, why, and what it affects._
