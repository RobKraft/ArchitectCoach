# Constitution input — Site with a backend/database

Give this to `/speckit.constitution`, together with the answers to the budget, compliance,
sensitive-data, user-location, accessibility, and performance questions in `open-questions.md`.
These are the principles every spec, plan, and task must respect.

## 1. The architecture decisions are binding

- Who will use this site? → **Paying customers (subscription or e-commerce)**
- What's the main thing this site needs to do? → **Process payments or transactions**
- What architecture style fits best? → **Modular monolith — one deployable, cleanly separated internal modules**
- Which database fits best? → **MySQL (relational)**
- How should users log in? → **Managed auth provider (e.g. Auth0, Clerk, Supabase Auth)**
- Where should this be hosted? → **Traditional cloud VM (AWS EC2, DigitalOcean Droplet, etc.)**

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

- _Modular monolith — one deployable, cleanly separated internal modules:_ One codebase and one place to apply auth, plus clearer ownership of which module touches which data. A single vulnerability can still expose everything.
- _MySQL (relational):_ Never expose the database publicly; use a least-privilege app user, TLS, and parameterized queries (or an ORM) against SQL injection.
- _Managed auth provider (e.g. Auth0, Clerk, Supabase Auth):_ The vendor handles password storage, MFA, and breach detection — usually much safer than DIY. You still must verify tokens correctly on the server.
- _Traditional cloud VM (AWS EC2, DigitalOcean Droplet, etc.):_ You patch the OS, configure the firewall, harden SSH, and renew certificates. Easy to fall behind.

## 7. Governance, risk & compliance

- _Modular monolith — one deployable, cleanly separated internal modules:_ Module boundaries make it easier to show which code touches sensitive data.
- _MySQL (relational):_ Choose the provider's region for data residency, confirm encryption at rest, define a backup retention period, and check the vendor's compliance certifications.
- _Managed auth provider (e.g. Auth0, Clerk, Supabase Auth):_ The vendor processes user personal data — sign their DPA; most hold SOC 2 / ISO 27001, which helps your own compliance.
- _Traditional cloud VM (AWS EC2, DigitalOcean Droplet, etc.):_ Full control of the data's location, but also full responsibility for patching and backups.

## 8. Cost guardrails

Set a budget alert on every paid account at the monthly limit from `open-questions.md`.

- _Modular monolith — one deployable, cleanly separated internal modules:_ One bill per component; set a billing alert on the hosting account.
- _MySQL (relational):_ Watch storage and instance size; set billing alerts.
- _Managed auth provider (e.g. Auth0, Clerk, Supabase Auth):_ Track monthly active users against the free tier threshold — growth can trigger a sudden plan jump.
- _Traditional cloud VM (AWS EC2, DigitalOcean Droplet, etc.):_ Fixed price — but snapshots, extra disks, and bandwidth overages add line items.

## 9. Auditing for correctness

- _Modular monolith — one deployable, cleanly separated internal modules:_ Add architecture tests (e.g. dependency rules) so modules can't quietly reach into each other.
- _MySQL (relational):_ Use strict SQL mode so bad data errors instead of silently converting; test migrations and restores.
- _Managed auth provider (e.g. Auth0, Clerk, Supabase Auth):_ Use the vendor's login logs and anomaly alerts; write tests for your token verification and role checks.
- _Traditional cloud VM (AWS EC2, DigitalOcean Droplet, etc.):_ Keep server configuration in scripts (not hand edits); add uptime and disk monitoring.

## 10. Performance

- _Modular monolith — one deployable, cleanly separated internal modules:_ Fast: modules call each other in-process, with no network hops.
- _MySQL (relational):_ Excellent for typical web workloads.
- _Managed auth provider (e.g. Auth0, Clerk, Supabase Auth):_ Adds a redirect at login; nothing on normal requests if tokens are verified locally.
- _Traditional cloud VM (AWS EC2, DigitalOcean Droplet, etc.):_ Consistent, no cold starts; limited to one region unless you add a CDN.
