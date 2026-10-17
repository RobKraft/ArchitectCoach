import type { AssessmentCatalog } from "./types";

export const BACKEND_SITE_ASSESSMENTS: AssessmentCatalog = {
  "backend-site-architecture": {
    // Monolith
    "0": {
      deployment: { complexity: "Low", notes: "One app, one build, one deploy. Rollback means redeploying the previous version." },
      components: { accounts: ["App hosting", "Database", "Domain registrar"], notes: "The smallest set of moving parts." },
      cost: { bucket: "~$10/mo", notes: "One small app instance plus a small database; free tiers can cover early use." },
      security: "One codebase to secure and one place to apply auth — simplest to reason about. A single vulnerability can expose everything.",
      scalability: { level: "Medium", notes: "Scales well by adding instances behind a load balancer; scaling individual features separately isn't possible." },
      grc: "Easy to document and audit: one system, one data flow. Access control lives in one place.",
      auditing: "One test suite and one log stream; add request logging and error monitoring (e.g. Sentry) from day one.",
      costMonitoring: "One bill per component; set a billing alert on the hosting account.",
      performance: "Fast: in-process function calls with no network hops between parts.",
    },
    // Modular monolith
    "1": {
      deployment: { complexity: "Low", notes: "Deploys exactly like a monolith; the module boundaries are code organization, not infrastructure." },
      components: { accounts: ["App hosting", "Database", "Domain registrar"], notes: "The smallest set of moving parts — module boundaries add no infrastructure." },
      cost: { bucket: "~$10/mo", notes: "One small app instance plus a small database; free tiers can cover early use." },
      security: "One codebase and one place to apply auth, plus clearer ownership of which module touches which data. A single vulnerability can still expose everything.",
      scalability: { level: "Medium", notes: "Scales like a monolith now, and a module can be pulled out into its own service later if it really needs to." },
      grc: "Module boundaries make it easier to show which code touches sensitive data.",
      auditing: "Add architecture tests (e.g. dependency rules) so modules can't quietly reach into each other.",
      costMonitoring: "One bill per component; set a billing alert on the hosting account.",
      performance: "Fast: modules call each other in-process, with no network hops.",
    },
    // Separate frontend + API
    "2": {
      deployment: { complexity: "Medium", notes: "Two deployables that must stay compatible; API changes need versioning or coordinated releases." },
      components: { accounts: ["Frontend hosting", "API hosting", "Database", "Domain registrar (plus DNS for api.* subdomain)"], notes: "Also CORS settings and an API base URL per environment." },
      cost: { bucket: "~$10/mo", notes: "Frontend is often free on a static host; the API and database are ~$5–25/mo." },
      security: "CORS, token storage in the browser, and API auth all become explicit concerns. The API is publicly reachable — rate limiting matters.",
      scalability: { level: "High", notes: "Frontend scales on a CDN for free; the API scales independently." },
      grc: "Two systems to document; make sure the API's logs don't capture personal data you didn't mean to keep.",
      auditing: "Contract tests between frontend and API catch breaking changes; monitor both separately.",
      costMonitoring: "Two bills — set alerts on both, especially API egress.",
      performance: "Very fast page loads from the CDN; each data fetch adds an API round trip.",
    },
    // Microservices
    "3": {
      deployment: { complexity: "High", notes: "Many services, each with its own pipeline, config, and version — usually needs containers, orchestration, and service discovery." },
      components: { accounts: ["Container registry", "Orchestration (e.g. Kubernetes or a managed equivalent)", "Multiple databases", "Message queue", "Centralized logging/tracing", "Secrets manager"], notes: "Each service multiplies the operational surface." },
      cost: { bucket: "$100+/mo", notes: "Several always-on services, separate databases, and observability tooling add up quickly even at low traffic." },
      security: "Service-to-service auth, network policies, secrets per service, and a much larger attack surface.",
      scalability: { level: "High", notes: "Each service scales independently — the main reason to choose it, and rarely needed early." },
      grc: "Personal data spread across many stores makes deletion requests and data mapping harder.",
      auditing: "Requires distributed tracing and contract tests; a bug may only appear when services interact.",
      costMonitoring: "Tag every resource by service and use budget alerts per team/service; idle services still cost money.",
      performance: "Network hops between services add latency; usually slower per request than a monolith unless carefully designed.",
    },
  },

  "backend-site-database": {
    // PostgreSQL
    "0": {
      deployment: { complexity: "Medium", notes: "Use a managed provider (Neon, Supabase, RDS, Azure) and run migrations as part of each deploy." },
      components: { accounts: ["Managed Postgres provider"], notes: "Plus backup settings and a migration tool (e.g. Prisma, Flyway)." },
      cost: { bucket: "~$10/mo", notes: "Free tiers exist (Neon, Supabase); small paid instances ~$5–25/mo." },
      security: "Never expose the database publicly; use a least-privilege app user, TLS, and parameterized queries (or an ORM) against SQL injection.",
      scalability: { level: "High", notes: "Handles far more than most apps need; read replicas and connection pooling come next." },
      grc: "Choose the provider's region for data residency; encryption at rest is standard on managed services. Define a backup retention period.",
      auditing: "Database constraints catch bad data; run migrations in CI against a real Postgres; test restoring a backup.",
      costMonitoring: "Watch storage growth and compute hours on serverless plans; set billing alerts.",
      performance: "Excellent for relational queries with the right indexes; use EXPLAIN on slow queries.",
    },
    // MySQL
    "1": {
      deployment: { complexity: "Medium", notes: "Use a managed provider (PlanetScale, RDS, Azure) and run migrations as part of each deploy." },
      components: { accounts: ["Managed MySQL provider (e.g. PlanetScale, RDS, Azure)"], notes: "Plus backups and a migration tool." },
      cost: { bucket: "~$10/mo", notes: "Small managed instances ~$5–25/mo; free tiers are rarer than for Postgres." },
      security: "Never expose the database publicly; use a least-privilege app user, TLS, and parameterized queries (or an ORM) against SQL injection.",
      scalability: { level: "High", notes: "Proven at very large scale; read replicas are mature." },
      grc: "Choose the provider's region for data residency, confirm encryption at rest, define a backup retention period, and check the vendor's compliance certifications.",
      auditing: "Use strict SQL mode so bad data errors instead of silently converting; test migrations and restores.",
      costMonitoring: "Watch storage and instance size; set billing alerts.",
      performance: "Excellent for typical web workloads.",
    },
    // MongoDB
    "2": {
      deployment: { complexity: "Medium", notes: "Usually MongoDB Atlas; no schema migrations, but data-shape changes still need scripts." },
      components: { accounts: ["MongoDB Atlas (or another host)"], notes: "Plus IP allow-listing and backup settings." },
      cost: { bucket: "~$10/mo", notes: "Free shared cluster for development; dedicated clusters start around $50/mo." },
      security: "Never run with auth disabled or open to the internet (a classic breach cause). Watch for NoSQL injection in query filters.",
      scalability: { level: "High", notes: "Scales horizontally with sharding; best when data is naturally document-shaped." },
      grc: "Flexible schemas make it easy to store personal data you didn't intend to — define and validate document shapes.",
      auditing: "Use schema validation rules; cross-document consistency is easier to get wrong than with SQL joins and constraints.",
      costMonitoring: "Watch the cluster tier — the jump from shared to dedicated is a big price step.",
      performance: "Very fast for reading whole documents; weaker for complex joins and reports.",
    },
    // SQLite
    "3": {
      deployment: { complexity: "Low", notes: "A single file next to the app — but it needs persistent disk, which rules out most serverless hosts." },
      components: { accounts: [], notes: "No database service at all (or a hosted variant like Turso)." },
      cost: { bucket: "Free", notes: "No database bill; you pay only for the app server's disk." },
      security: "No network port to attack. Protect the file with OS permissions and include it in backups.",
      scalability: { level: "Low", notes: "One writer at a time on one machine. Great for small/read-heavy apps; hard to run several app instances." },
      grc: "Backups are your responsibility — a lost disk means lost data unless you replicate (e.g. Litestream).",
      auditing: "Run an integrity check and test backup restores regularly.",
      costMonitoring: "Nothing to monitor beyond disk size.",
      performance: "Extremely fast for reads on one server — no network hop at all.",
    },
  },

  "backend-site-auth": {
    // Email/password, handled yourself
    "0": {
      deployment: { complexity: "Medium", notes: "You build sign-up, login, password reset, and email verification — plus an email-sending service." },
      components: { accounts: ["Transactional email service (e.g. Postmark, SendGrid, Resend)"], notes: "Users and password hashes live in your own database." },
      cost: { bucket: "Free", notes: "Email services are free or ~$1–15/mo at low volume. The real cost is development and maintenance time." },
      security: "Highest risk: password hashing (argon2/bcrypt), session handling, brute-force protection, reset-token flows, and MFA are all on you.",
      scalability: { level: "High", notes: "Scales with your database; no per-user vendor fees." },
      grc: "You hold credentials — a breach is a notifiable incident in most jurisdictions. Needs a documented security process.",
      auditing: "Log every login, failure, and password reset; test the reset flow end to end; get a security review before launch.",
      costMonitoring: "Watch email-sending volume — a bot hammering sign-up or reset can drive it up.",
      performance: "Fast; password hashing is deliberately slow (~100 ms) — that's expected.",
    },
    // Managed auth provider (Auth0, Clerk, Supabase Auth)
    "1": {
      deployment: { complexity: "Low", notes: "Install an SDK, configure redirect URLs per environment, and add login pages from the vendor." },
      components: { accounts: ["Auth provider (e.g. Auth0, Clerk, Supabase Auth)"], notes: "Separate configuration for development and production." },
      cost: { bucket: "Free", notes: "Free up to ~10,000–25,000 monthly active users; paid tiers often jump to $25–$100+/mo, and SSO features cost more." },
      security: "The vendor handles password storage, MFA, and breach detection — usually much safer than DIY. You still must verify tokens correctly on the server.",
      scalability: { level: "High", notes: "Scales with the vendor; pricing, not technology, is the limit." },
      grc: "The vendor processes user personal data — sign their DPA; most hold SOC 2 / ISO 27001, which helps your own compliance.",
      auditing: "Use the vendor's login logs and anomaly alerts; write tests for your token verification and role checks.",
      costMonitoring: "Track monthly active users against the free tier threshold — growth can trigger a sudden plan jump.",
      performance: "Adds a redirect at login; nothing on normal requests if tokens are verified locally.",
    },
    // Social login only
    "2": {
      deployment: { complexity: "Low", notes: "Register an OAuth app with each provider and configure callback URLs per environment." },
      components: { accounts: ["Developer accounts with each provider (Google, GitHub, etc.)"], notes: "One OAuth client and secret per provider per environment." },
      cost: { bucket: "Free", notes: "Free." },
      security: "No passwords to store. Protect OAuth client secrets and validate the state parameter to prevent CSRF.",
      scalability: { level: "High", notes: "No scaling concern." },
      grc: "Users without a Google/GitHub account can't sign in — an accessibility and reach issue. Request only the scopes you need.",
      auditing: "Test each provider's login flow after any config change; log which provider each user came from.",
      costMonitoring: "Nothing to monitor.",
      performance: "Adds a redirect to the provider at login only.",
    },
    // No authentication yet
    "3": {
      deployment: { complexity: "Low", notes: "Nothing to deploy." },
      components: { accounts: [], notes: "No extra accounts." },
      cost: { bucket: "Free", notes: "No cost." },
      security: "Anything the API can do, anyone can do. Only safe if the app holds no private data and has no write actions worth abusing.",
      scalability: { level: "High", notes: "Not applicable — but adding auth later means touching every route." },
      grc: "Don't collect personal data without access control. Add rate limiting even without logins.",
      auditing: "Make sure no admin or write endpoint is reachable from the public internet.",
      costMonitoring: "Unauthenticated endpoints can be abused to drive up usage-based costs — rate limit them.",
      performance: "No overhead.",
    },
  },

  "backend-site-hosting": {
    // Vercel or Netlify (serverless)
    "0": {
      deployment: { complexity: "Low", notes: "Git-push deploys with previews; backend code runs as serverless functions." },
      components: { accounts: ["Vercel/Netlify account", "Separate database provider", "Domain registrar"], notes: "The database almost always comes from another vendor." },
      cost: { bucket: "~$10/mo", notes: "Free to start; commercial use needs Pro (~$20/member/mo), plus the database." },
      security: "No servers to patch. Keep secrets in the platform's environment variables, never in client code.",
      scalability: { level: "High", notes: "Scales automatically. Watch database connection limits — many function instances can exhaust them (use pooling)." },
      grc: "Pick function regions near your database and users; sign each vendor's DPA.",
      auditing: "Deploy previews, function logs, and instant rollback; add error monitoring.",
      costMonitoring: "Set a spend cap — function invocations and bandwidth are usage-billed.",
      performance: "Fast static pages; functions can have cold starts of a few hundred milliseconds.",
    },
    // Traditional cloud VM
    "1": {
      deployment: { complexity: "High", notes: "You set up the OS, runtime, reverse proxy, TLS, process manager, and a deploy script." },
      components: { accounts: ["Cloud provider account", "Domain registrar", "Backup solution"], notes: "You also own OS updates and monitoring." },
      cost: { bucket: "~$10/mo", notes: "A small VM ~$5–20/mo — cheap, predictable, and you can run the database on it too." },
      security: "You patch the OS, configure the firewall, harden SSH, and renew certificates. Easy to fall behind.",
      scalability: { level: "Medium", notes: "Scale up by resizing; scaling out needs a load balancer and more manual setup." },
      grc: "Full control of the data's location, but also full responsibility for patching and backups.",
      auditing: "Keep server configuration in scripts (not hand edits); add uptime and disk monitoring.",
      costMonitoring: "Fixed price — but snapshots, extra disks, and bandwidth overages add line items.",
      performance: "Consistent, no cold starts; limited to one region unless you add a CDN.",
    },
    // Managed container platform (Render, Fly.io, Railway)
    "2": {
      deployment: { complexity: "Medium", notes: "Push code or a Dockerfile; the platform builds and runs it, with TLS and health checks included." },
      components: { accounts: ["Container platform account", "Database (often same platform)", "Domain registrar"], notes: "Often one vendor for app and database." },
      cost: { bucket: "~$10/mo", notes: "~$5–25/mo for a small always-on app plus database." },
      security: "The platform patches the hosts; you keep your container image's dependencies updated.",
      scalability: { level: "High", notes: "Add instances or regions from the dashboard." },
      grc: "Choose regions deliberately; check backup and data-retention options on the managed database.",
      auditing: "Deploy history, health checks, and logs; add error monitoring.",
      costMonitoring: "Usage-based with fixed-size instances — check the monthly estimate after each scaling change.",
      performance: "Consistent, no cold starts on always-on instances.",
    },
    // Major cloud full platform (AWS/Azure/GCP)
    "3": {
      deployment: { complexity: "High", notes: "Many services to wire together (compute, networking, IAM, database); infrastructure-as-code is strongly recommended." },
      components: { accounts: ["Cloud account with IAM users/roles", "Compute service", "Managed database", "Secrets manager", "Monitoring", "Domain/DNS"], notes: "Powerful, but every piece needs configuration." },
      cost: { bucket: "~$50/mo", notes: "Easy to land at $30–100/mo for a small app once you add a load balancer, database, and logging; free credits help at first." },
      security: "Strongest tools available, but misconfigured IAM roles and public storage buckets are common breach causes.",
      scalability: { level: "High", notes: "Effectively unlimited." },
      grc: "Best compliance options (regions, certifications, audit logs) — and the most to configure correctly to actually use them.",
      auditing: "Turn on the provider's audit logs (CloudTrail / Activity Log); define infrastructure in code so changes are reviewable.",
      costMonitoring: "Set budgets and alerts on day one, tag resources, and review the bill monthly — forgotten resources are the classic surprise.",
      performance: "Excellent and tunable, but only as good as your configuration.",
    },
  },
};
