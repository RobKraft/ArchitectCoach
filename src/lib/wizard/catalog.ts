/**
 * Static, hand-authored wizard content: for project types listed here, the interview
 * is a fixed sequence of multiple-choice questions with pre-written tradeoffs — no AI
 * call is made to generate them. Project types not listed here still run the AI-driven
 * interview (see ChatPanel/interviewTools) until they get a catalog of their own.
 *
 * The key must match a label in PROJECT_TYPE_OPTIONS (src/lib/projectTypes.ts) exactly
 * — that's how a project's type is looked up (Project.name is set from that label at
 * creation and this app has no project-rename feature).
 */

export type WizardOption = {
  id: string;
  label: string;
  summary: string;
  tradeoffs: string;
  recommended?: boolean;
};

type WizardStepBase = {
  /** Stable id, unique within a project type's step list. */
  id: string;
  question: string;
  /** One or two sentences of framing shown above the question — why it matters. */
  whyItMatters: string;
  /** Wrap the picked label in a one-item array instead of storing it as a string. */
  multi?: boolean;
  /** When set, the pick is also recorded as a permanent Decision Record. */
  recordDecision?: { title: string; consequences?: string };
  options: WizardOption[];
};

export type RequirementsField = "purpose" | "users" | "goals" | "nonGoals" | "functionalRequirements";
export type ArchitectureField = "style" | "components" | "dataFlow" | "notes";
export type TechnologyField =
  | "frontend"
  | "backend"
  | "database"
  | "hosting"
  | "authentication"
  | "thirdPartyServices";

export type WizardStep =
  | (WizardStepBase & { topic: "requirements"; field: RequirementsField })
  | (WizardStepBase & { topic: "architecture"; field: ArchitectureField })
  | (WizardStepBase & { topic: "technology"; field: TechnologyField });

export const WIZARD_CATALOG: Record<string, WizardStep[]> = {
  "Static website": [
    {
      id: "static-website-audience",
      topic: "requirements",
      field: "users",
      multi: true,
      question: "Who is this static website for?",
      whyItMatters:
        "The audience shapes almost everything downstream — content structure, tone, hosting needs, and whether you need anything beyond plain pages.",
      options: [
        {
          id: "0",
          label: "Personal portfolio or blog",
          summary: "Showcasing your own work, writing, or projects to potential employers, clients, or readers.",
          tradeoffs:
            "Low stakes if something's imperfect, but it also means less pressure to over-engineer — a good fit for the simplest possible setup. Growth is usually slow and content-driven, not traffic-spike-driven.",
        },
        {
          id: "1",
          label: "Business or organization marketing site",
          summary: "Public-facing site for a company, nonprofit, or group to present information, build credibility, and drive conversions.",
          tradeoffs:
            "Needs to look polished and load fast since it affects credibility directly, and you'll likely want basic analytics and a contact path — but still doesn't need a database for most marketing sites.",
          recommended: true,
        },
        {
          id: "2",
          label: "Documentation or knowledge base",
          summary: "Technical docs, guides, or reference material for developers, users, or an internal team.",
          tradeoffs:
            "Search and navigation matter more than visual design here, which pushes toward a static site generator with built-in search rather than hand-written HTML.",
        },
        {
          id: "3",
          label: "Event or campaign landing page",
          summary: "Single-purpose page for a specific event, product launch, or marketing campaign with a clear call to action.",
          tradeoffs:
            "Usually short-lived and single-page, so simplicity wins — but if it needs to collect signups you'll need at least one third-party form service, since a static site can't process form submissions on its own.",
        },
      ],
    },
    {
      id: "static-website-goal",
      topic: "requirements",
      field: "goals",
      multi: true,
      question: "What's the main goal for this site?",
      whyItMatters:
        "The primary goal determines what \"success\" looks like and which features are actually worth building versus nice-to-have.",
      options: [
        {
          id: "0",
          label: "Get discovered through search and attract visitors organically",
          summary: "Content and SEO fundamentals (clean URLs, fast loads, good metadata) matter most.",
          tradeoffs:
            "Pays off slowly — organic traffic takes months to build — but doesn't require any ongoing spend or infrastructure beyond hosting.",
        },
        {
          id: "1",
          label: "Convert visitors into leads or customers",
          summary: "Clear calls to action, a contact or signup path, and basic analytics to see what's working.",
          tradeoffs:
            "Needs at least one third-party integration (a form handler and/or analytics), which is the first thing that pushes a \"pure\" static site to depend on an external service.",
          recommended: true,
        },
        {
          id: "2",
          label: "Provide reliable reference information people can search",
          summary: "Findability and accuracy matter more than persuasion or visual polish.",
          tradeoffs:
            "Content maintenance becomes the real ongoing cost, not the code — stale docs are worse than no docs.",
        },
        {
          id: "3",
          label: "Drive signups or registrations for a specific event",
          summary: "One clear conversion action with a deadline, rather than ongoing traffic growth.",
          tradeoffs:
            "Time-boxed, so it's fine to accept more manual/less scalable choices (e.g. a third-party registration form) than you would for a permanent site.",
        },
      ],
    },
    {
      id: "static-website-build-approach",
      topic: "architecture",
      field: "style",
      question: "How should this site be built?",
      whyItMatters:
        "This is the core architectural choice for a static site — it determines your authoring workflow, build step (if any), and how much tooling you're taking on.",
      recordDecision: {
        title: "Static site build approach",
        consequences:
          "Sets the authoring workflow for every page added later and determines what build tooling (if any) is part of the project going forward.",
      },
      options: [
        {
          id: "0",
          label: "Plain HTML, CSS, and JavaScript",
          summary: "Hand-written pages, no build step, no framework.",
          tradeoffs:
            "Zero tooling to learn or maintain, but repeating shared elements (nav, footer) across pages is manual and error-prone as the site grows past a handful of pages.",
        },
        {
          id: "1",
          label: "Static site generator (e.g. Eleventy, Hugo, Jekyll)",
          summary: "Write content in templates/Markdown; the generator builds plain HTML at build time.",
          tradeoffs:
            "Shared layout and reusable content become easy, and output is still plain fast HTML — but you're adding a build step and a tool-specific templating language to learn.",
          recommended: true,
        },
        {
          id: "2",
          label: "Component framework exported as static files (e.g. Next.js/Astro static export)",
          summary: "Build the site with a modern component framework, then export it to static HTML/JS at build time.",
          tradeoffs:
            "Most powerful option for interactive components and future growth, but it's the heaviest tooling for a site that may never need it — overkill for a simple brochure site or blog.",
        },
      ],
    },
    {
      id: "static-website-hosting",
      topic: "technology",
      field: "hosting",
      question: "Where should this site be hosted?",
      whyItMatters:
        "Hosting affects cost, deploy workflow, and how custom domains/HTTPS get set up — worth deciding before you build so you're not fighting the platform later.",
      recordDecision: {
        title: "Static website hosting",
        consequences: "Determines the deploy workflow and how a custom domain and HTTPS get configured.",
      },
      options: [
        {
          id: "0",
          label: "GitHub Pages",
          summary: "Free hosting straight from a GitHub repo.",
          tradeoffs:
            "Free and simple, but fewer built-in features (no server-side redirects, limited build customization) than a dedicated static host.",
        },
        {
          id: "1",
          label: "Netlify",
          summary: "Static hosting with built-in CI/CD, form handling, and a generous free tier.",
          tradeoffs:
            "The built-in form handling is genuinely useful for a static site with no backend, but you're depending on a third-party platform for that feature rather than owning it.",
          recommended: true,
        },
        {
          id: "2",
          label: "Vercel",
          summary: "Static hosting with strong support for modern frontend frameworks and fast global CDN delivery.",
          tradeoffs:
            "Excellent if the build approach above is a component framework; less of an advantage for plain HTML or a generator site where Netlify's form handling matters more.",
        },
        {
          id: "3",
          label: "Traditional web hosting (shared hosting or a VPS)",
          summary: "Upload files to a conventional web host you pay for directly.",
          tradeoffs:
            "Gives full control and no platform lock-in, but you own deploys, HTTPS renewal, and CDN/caching yourself instead of getting them for free.",
        },
      ],
    },
    {
      id: "static-website-analytics",
      topic: "technology",
      field: "thirdPartyServices",
      multi: true,
      question: "Do you need visitor analytics?",
      whyItMatters:
        "Analytics is the most common reason a \"pure\" static site ends up loading a third-party script — worth deciding deliberately rather than bolting on later.",
      recordDecision: {
        title: "Visitor analytics",
        consequences: "Adds a third-party script (except for the \"none\" option) that runs in every visitor's browser.",
      },
      options: [
        {
          id: "0",
          label: "No analytics needed",
          summary: "Skip analytics entirely for now.",
          tradeoffs:
            "Simplest and most private option, but you'll have no visibility into traffic or what content is actually working.",
        },
        {
          id: "1",
          label: "Privacy-friendly analytics (e.g. Plausible, Fathom)",
          summary: "Lightweight, cookie-free analytics services built around not tracking individual visitors.",
          tradeoffs:
            "Usually a paid service (small monthly cost) and less granular than Google Analytics, but no cookie-consent banner needed and better visitor privacy.",
          recommended: true,
        },
        {
          id: "2",
          label: "Google Analytics",
          summary: "The most widely used analytics platform, free, with deep reporting features.",
          tradeoffs:
            "Free and extremely capable, but adds real tracking of individual visitors, which typically requires a cookie-consent banner depending on your audience's location.",
        },
      ],
    },
  ],

  "Static site with a blog": [
    {
      id: "blog-audience",
      topic: "requirements",
      field: "users",
      multi: true,
      question: "Who is this blog for?",
      whyItMatters:
        "Audience determines voice, publishing cadence, and whether you need more than one author account.",
      options: [
        {
          id: "0",
          label: "Personal audience — writing under your own name",
          summary: "An individual's blog, built around one voice and one author's interests.",
          tradeoffs:
            "Simplest to run — no multi-author workflow needed — but growth depends entirely on your own content output and reach.",
        },
        {
          id: "1",
          label: "Company or product blog for marketing/SEO",
          summary: "Public-facing posts that support a business's marketing and search visibility.",
          tradeoffs:
            "Usually needs consistent publishing and basic analytics to justify the effort, and content review/approval becomes a real workflow question.",
          recommended: true,
        },
        {
          id: "2",
          label: "Team or engineering blog sharing technical updates",
          summary: "Posts from a product/engineering team about what they're building or learning.",
          tradeoffs:
            "Multiple occasional authors is common, which pushes toward a CMS or Markdown-in-git workflow over a single-author tool.",
        },
        {
          id: "3",
          label: "Multi-author publication with several regular contributors",
          summary: "A publication-style blog with an editorial process and several ongoing writers.",
          tradeoffs:
            "Needs real author management and a review workflow — the strongest case for a CMS rather than hand-edited files.",
        },
      ],
    },
    {
      id: "blog-goal",
      topic: "requirements",
      field: "goals",
      multi: true,
      question: "What's the main goal for the blog?",
      whyItMatters: "The goal determines what to optimize for — reach, retention, or simply keeping a record.",
      options: [
        {
          id: "0",
          label: "Build a personal audience or portfolio over time",
          summary: "Long-term reputation and writing practice matter more than any single post's traffic.",
          tradeoffs: "Slow payoff, but very low pressure and no real infrastructure demands.",
        },
        {
          id: "1",
          label: "Drive traffic and leads for a business",
          summary: "Posts exist to bring visitors to a product or service and convert some of them.",
          tradeoffs:
            "Worth investing in SEO fundamentals and analytics from day one, since the whole point is measurable traffic.",
          recommended: true,
        },
        {
          id: "2",
          label: "Keep existing users or customers informed with updates",
          summary: "A changelog/announcements-style blog read mostly by people who already use the product.",
          tradeoffs: "RSS and email notification matter more here than search discoverability.",
        },
        {
          id: "3",
          label: "Establish authority or expertise in a topic area",
          summary: "Longer, deeper posts aimed at building credibility with a knowledgeable audience.",
          tradeoffs: "Quality and depth matter more than frequency — a slower, more deliberate publishing pace is fine.",
        },
      ],
    },
    {
      id: "blog-build-approach",
      topic: "architecture",
      field: "style",
      question: "How should posts be authored and the site built?",
      whyItMatters:
        "This decides your day-to-day writing workflow (a text editor and git vs. a web-based editor) as much as it decides the tech stack.",
      recordDecision: {
        title: "Blog authoring and build approach",
        consequences: "Sets how every future post gets written and published, and who besides you can contribute.",
      },
      options: [
        {
          id: "0",
          label: "Markdown files in a static site generator (e.g. Hugo, Eleventy, Jekyll)",
          summary: "Write posts as Markdown files in your code repo; the generator builds the site.",
          tradeoffs:
            "Free, fast, and versioned alongside your code, but writing requires comfort with Markdown and git — not friendly for non-technical co-authors.",
          recommended: true,
        },
        {
          id: "1",
          label: "Headless CMS (e.g. Contentful, Sanity) plus a static site generator",
          summary: "Content is authored in a web editor and pulled into a static-generated site at build time.",
          tradeoffs:
            "Non-technical authors can write and publish without touching code, but you're adding a paid third-party service and a content-fetching build step.",
        },
        {
          id: "2",
          label: "All-in-one blogging platform (e.g. WordPress, Ghost)",
          summary: "A dedicated platform that handles authoring, hosting, and publishing together.",
          tradeoffs:
            "Fastest to start writing and very non-technical-author-friendly, but you're no longer running a \"static\" site — the platform runs a live server and needs its own maintenance/updates.",
        },
      ],
    },
    {
      id: "blog-hosting",
      topic: "technology",
      field: "hosting",
      question: "Where should this be hosted?",
      whyItMatters: "Hosting needs to match the build approach above — a static-generator blog and a platform like WordPress host very differently.",
      recordDecision: {
        title: "Blog hosting",
        consequences: "Determines the publish workflow and who's responsible for platform updates and uptime.",
      },
      options: [
        {
          id: "0",
          label: "GitHub Pages",
          summary: "Free static hosting straight from your repo — a natural fit for the Markdown/git approach.",
          tradeoffs: "Free and simple, but no built-in CMS webhook support if you later add a headless CMS.",
        },
        {
          id: "1",
          label: "Netlify",
          summary: "Static hosting with CI/CD and webhook-triggered rebuilds — a good fit if a headless CMS is involved.",
          tradeoffs: "Free tier is generous, but rebuild minutes and bandwidth are metered once you outgrow it.",
          recommended: true,
        },
        {
          id: "2",
          label: "Vercel",
          summary: "Static hosting with strong support for modern frontend frameworks and fast global delivery.",
          tradeoffs: "Excellent if the site is built with a component framework; less differentiated for a plain generator site.",
        },
        {
          id: "3",
          label: "Managed hosting for your platform (e.g. WordPress.com, Ghost(Pro))",
          summary: "Hosting purpose-built for an all-in-one blogging platform.",
          tradeoffs: "Only fits if you picked the all-in-one platform above — it manages updates for you but usually costs a recurring fee.",
        },
      ],
    },
    {
      id: "blog-comments",
      topic: "technology",
      field: "thirdPartyServices",
      multi: true,
      question: "Do you want reader comments on posts?",
      whyItMatters:
        "Comments are the most common reason a blog needs anything beyond static files — worth deciding deliberately rather than adding later under pressure.",
      recordDecision: {
        title: "Reader comments",
        consequences: "A full custom comment system pulls in a database and moderation workload; the other options avoid that entirely.",
      },
      options: [
        {
          id: "0",
          label: "No comments",
          summary: "Skip comments entirely.",
          tradeoffs: "Zero moderation burden and stays fully static, but readers have no way to engage directly on the post.",
        },
        {
          id: "1",
          label: "Lightweight third-party comments (e.g. giscus, Disqus)",
          summary: "Comments are handled entirely by an embedded third-party widget.",
          tradeoffs:
            "Keeps the site static with no backend of your own, but you depend on that service staying available and it may show ads or track visitors depending on which one you pick.",
          recommended: true,
        },
        {
          id: "2",
          label: "Full custom comments (requires a backend and database)",
          summary: "You build and own the comment system end to end.",
          tradeoffs:
            "Full control over moderation and data, but this is no longer a static site — it now needs a backend, a database, and ongoing moderation work.",
        },
      ],
    },
  ],

  "Site with a backend/database": [
    {
      id: "backend-site-users",
      topic: "requirements",
      field: "users",
      multi: true,
      question: "Who will use this site?",
      whyItMatters:
        "Who's logging in (or not) shapes the data model, the authentication approach, and how much you need to worry about abuse and access control.",
      options: [
        {
          id: "0",
          label: "General public / consumers",
          summary: "Anyone can sign up and use the product; no vetting or approval process.",
          tradeoffs: "Widest reach, but also the most exposure to spam/abuse signups and the highest scale uncertainty.",
        },
        {
          id: "1",
          label: "Paying customers (subscription or e-commerce)",
          summary: "Access is tied to payment — a subscription, a purchase, or both.",
          tradeoffs: "Adds real payment-processing and billing complexity, but users are inherently more invested and easier to support.",
          recommended: true,
        },
        {
          id: "2",
          label: "Internal team or employees only",
          summary: "A tool used only inside your own organization.",
          tradeoffs: "Much lower security/scale pressure, and login can often piggyback on existing company accounts (SSO) instead of building your own.",
        },
        {
          id: "3",
          label: "Other businesses (B2B) via login",
          summary: "Business customers, typically with their own accounts/organizations within the product.",
          tradeoffs:
            "Usually needs multi-tenancy (data scoped per customer organization) from the start, which is a real architectural decision, not an afterthought.",
        },
      ],
    },
    {
      id: "backend-site-goal",
      topic: "requirements",
      field: "goals",
      multi: true,
      question: "What's the main thing this site needs to do?",
      whyItMatters: "This is the core function the rest of the architecture has to support well.",
      options: [
        {
          id: "0",
          label: "Let users create accounts and manage their own data",
          summary: "The core loop is: sign up, store personal data, come back and manage it.",
          tradeoffs: "Straightforward CRUD-shaped app — a very well-trodden path with lots of tooling support.",
          recommended: true,
        },
        {
          id: "1",
          label: "Process payments or transactions",
          summary: "Money moves through the system — purchases, subscriptions, or payouts.",
          tradeoffs: "Brings in real compliance and security obligations (PCI scope) even if you use a payment provider to avoid handling card data directly.",
        },
        {
          id: "2",
          label: "Provide an admin tool for internal operations",
          summary: "Primarily a back-office tool for staff to view and manage data, not a public-facing product.",
          tradeoffs: "Lower design/polish pressure, but still needs solid access control since it touches real operational data.",
        },
        {
          id: "3",
          label: "Aggregate or display data from other systems",
          summary: "The site's main job is pulling data from elsewhere (APIs, other databases) and presenting it.",
          tradeoffs: "Reliability of the upstream systems becomes your reliability problem too — worth planning for their downtime.",
        },
      ],
    },
    {
      id: "backend-site-architecture",
      topic: "architecture",
      field: "style",
      question: "What architecture style fits best?",
      whyItMatters:
        "This is the single biggest lever on how fast you can build and how easy the system is to operate — and it's expensive to change later.",
      recordDecision: {
        title: "Architecture style",
        consequences: "Determines how many deployables exist, how teams can work in parallel, and the baseline operational complexity.",
      },
      options: [
        {
          id: "0",
          label: "Monolith — one deployable app for everything",
          summary: "Frontend, backend, and database all part of a single application you deploy as one unit.",
          tradeoffs:
            "Fastest to build and simplest to operate for most new projects, but everything scales and deploys together, which becomes a real limit only at meaningful scale.",
          recommended: true,
        },
        {
          id: "1",
          label: "Modular monolith — one deployable, cleanly separated internal modules",
          summary: "Still one deployable, but organized into well-bounded modules as if they might be split out later.",
          tradeoffs: "More upfront design discipline than a plain monolith, in exchange for an easier path to splitting things out later if you ever need to.",
        },
        {
          id: "2",
          label: "Separate frontend and API backend (two deployables)",
          summary: "A frontend app and a backend API deployed and scaled independently.",
          tradeoffs: "Lets frontend and backend evolve and scale somewhat independently, at the cost of running and coordinating two deployments instead of one.",
        },
        {
          id: "3",
          label: "Microservices — multiple independently deployable services",
          summary: "The system is split into several small services, each deployed and scaled on its own.",
          tradeoffs:
            "Real independent scaling and team autonomy, but substantial operational overhead (service discovery, distributed debugging, network reliability) that rarely pays off before you have real scale or team-size pressure.",
        },
      ],
    },
    {
      id: "backend-site-database",
      topic: "technology",
      field: "database",
      question: "Which database fits best?",
      whyItMatters: "The database shapes how naturally your data model fits, and how much flexibility you have later to change it.",
      recordDecision: {
        title: "Primary database",
        consequences: "Sets the data modeling approach and query patterns for the rest of the project.",
      },
      options: [
        {
          id: "0",
          label: "PostgreSQL (relational)",
          summary: "A mature, fully-featured relational database.",
          tradeoffs: "Excellent default for most apps with structured, related data — the tradeoff is mostly upfront schema design discipline.",
          recommended: true,
        },
        {
          id: "1",
          label: "MySQL (relational)",
          summary: "Another mature, widely-supported relational database.",
          tradeoffs: "Very similar tradeoffs to PostgreSQL; mainly worth picking over it for existing team familiarity or a hosting platform that favors it.",
        },
        {
          id: "2",
          label: "MongoDB (document)",
          summary: "A document database storing flexible, JSON-like records instead of fixed tables.",
          tradeoffs:
            "Schema flexibility is convenient early on, but relational queries across documents are harder, and weaker default consistency guarantees can surprise you later.",
        },
        {
          id: "3",
          label: "SQLite (simple file-based)",
          summary: "A lightweight database stored as a single file, no separate server process.",
          tradeoffs: "Zero infrastructure to run, but not built for multiple concurrent writers — a poor fit once more than one person/process writes at once.",
        },
      ],
    },
    {
      id: "backend-site-auth",
      topic: "technology",
      field: "authentication",
      question: "How should users log in?",
      whyItMatters: "Authentication is security-critical and easy to get subtly wrong — worth a deliberate choice rather than defaulting to \"build it ourselves.\"",
      recordDecision: {
        title: "Authentication approach",
        consequences: "Determines who's responsible for credential security and how much custom login UI/flow you maintain.",
      },
      options: [
        {
          id: "0",
          label: "Email and password, handled yourself",
          summary: "You build and store your own login system.",
          tradeoffs: "Full control, but you own password storage security, reset flows, and every edge case — real risk if done casually.",
        },
        {
          id: "1",
          label: "Managed auth provider (e.g. Auth0, Clerk, Supabase Auth)",
          summary: "A dedicated service handles signup, login, sessions, and security for you.",
          tradeoffs: "Offloads the hardest security work to specialists, at the cost of a recurring bill and a dependency on their uptime.",
          recommended: true,
        },
        {
          id: "2",
          label: "Social login only (Google/GitHub/etc. via OAuth)",
          summary: "Users sign in with an existing account from another provider — no passwords of your own.",
          tradeoffs: "No password storage risk at all, but you're fully dependent on those providers and it excludes users who don't have (or don't want to use) those accounts.",
        },
        {
          id: "3",
          label: "No authentication needed yet",
          summary: "The site doesn't require accounts at all right now.",
          tradeoffs: "Simplest possible starting point, but retrofitting auth later usually touches more of the codebase than building it in from the start.",
        },
      ],
    },
    {
      id: "backend-site-hosting",
      topic: "technology",
      field: "hosting",
      question: "Where should this be hosted?",
      whyItMatters: "Hosting affects cost predictability, how much infrastructure you manage yourself, and how easy scaling is later.",
      recordDecision: {
        title: "Hosting platform",
        consequences: "Determines the deploy workflow and how much infrastructure (servers, scaling, networking) you're responsible for directly.",
      },
      options: [
        {
          id: "0",
          label: "Vercel or Netlify (serverless-friendly platforms)",
          summary: "Deploy-by-git platforms built around serverless functions and static assets.",
          tradeoffs: "Very fast to deploy and scales automatically, but serverless function limits (execution time, cold starts) can be a poor fit for long-running backend work.",
        },
        {
          id: "1",
          label: "Traditional cloud VM (AWS EC2, DigitalOcean Droplet, etc.)",
          summary: "A virtual machine you configure and manage yourself.",
          tradeoffs: "Maximum control and no platform limits, but you own OS updates, scaling, and uptime yourself.",
        },
        {
          id: "2",
          label: "Managed container platform (e.g. Render, Fly.io, Railway)",
          summary: "Deploy a container without managing the underlying servers yourself.",
          tradeoffs: "A good middle ground — much less infrastructure work than a raw VM, with fewer of the runtime limits of a pure serverless platform.",
          recommended: true,
        },
        {
          id: "3",
          label: "A major cloud provider's full platform (AWS/Azure/GCP)",
          summary: "Build on the provider's full suite of managed services.",
          tradeoffs: "The most powerful and scalable option, and the most to learn and configure — usually more than a new project needs on day one.",
        },
      ],
    },
  ],

  "Phone app": [
    {
      id: "phone-app-users",
      topic: "requirements",
      field: "users",
      multi: true,
      question: "Who is this app for?",
      whyItMatters: "Distribution and account requirements differ a lot between a public app-store app and a private internal tool.",
      options: [
        {
          id: "0",
          label: "General consumers (public app store)",
          summary: "Anyone can find and download it from the App Store / Play Store.",
          tradeoffs: "Widest reach, but subject to app-store review policies and ongoing store compliance requirements.",
          recommended: true,
        },
        {
          id: "1",
          label: "Your own customers (branded companion app)",
          summary: "An app tied to an existing product or service, used by people who already have an account with you.",
          tradeoffs: "Usually needs to talk to your existing backend/accounts system rather than starting from a blank slate.",
        },
        {
          id: "2",
          label: "Internal employees or field workers",
          summary: "A tool for your own staff, often used in the field rather than at a desk.",
          tradeoffs: "Can skip public app-store distribution (using enterprise/internal distribution instead), but often needs to work reliably with poor connectivity.",
        },
        {
          id: "3",
          label: "A small private group (friends, family, a club)",
          summary: "A small, known set of users rather than the general public.",
          tradeoffs: "Very low scale and security pressure — often not worth a public store listing at all.",
        },
      ],
    },
    {
      id: "phone-app-goal",
      topic: "requirements",
      field: "goals",
      multi: true,
      question: "What's the main goal for this app?",
      whyItMatters: "This determines which mobile-specific capabilities (offline support, notifications, sensors) actually matter.",
      options: [
        {
          id: "0",
          label: "Provide on-the-go access to a service or content",
          summary: "A mobile-friendly window into something that may also exist on the web.",
          tradeoffs: "Often the case a mobile web app or PWA could also serve well — worth confirming a native/cross-platform app is really needed.",
        },
        {
          id: "1",
          label: "Enable a specific task (e.g. tracking, ordering, booking)",
          summary: "The app exists to make one core workflow fast and convenient on a phone.",
          tradeoffs: "Keeping scope tight to that one task is what makes a mobile app feel good — resist adding unrelated features.",
          recommended: true,
        },
        {
          id: "2",
          label: "Engage users with notifications or community features",
          summary: "Ongoing engagement (push notifications, feeds, social features) is central to the app's value.",
          tradeoffs: "Push notification infrastructure and moderation become real, ongoing responsibilities, not a one-time setup.",
        },
        {
          id: "3",
          label: "Support offline or field use where connectivity is unreliable",
          summary: "The app needs to keep working, and sync later, when there's no signal.",
          tradeoffs: "Offline-first data sync is one of the harder problems in mobile development — plan real time for it, it's rarely trivial.",
        },
      ],
    },
    {
      id: "phone-app-architecture",
      topic: "architecture",
      field: "style",
      question: "How should this app be built?",
      whyItMatters: "This decides whether you maintain one codebase or two, and how much native platform capability you get access to.",
      recordDecision: {
        title: "Mobile app build approach",
        consequences: "Sets how many codebases exist going forward and how directly the app can use native platform features.",
      },
      options: [
        {
          id: "0",
          label: "Native (separate Swift/iOS and Kotlin/Android codebases)",
          summary: "Two fully separate apps, each built with the platform's own tools and language.",
          tradeoffs: "Best possible performance and access to every platform feature, at the cost of building and maintaining two codebases in parallel.",
        },
        {
          id: "1",
          label: "Cross-platform framework (e.g. React Native, Flutter)",
          summary: "One codebase that compiles to both iOS and Android apps.",
          tradeoffs: "Much less duplicated work than native, and still gives good access to native features — the most common right default for a new app.",
          recommended: true,
        },
        {
          id: "2",
          label: "Web app wrapped as a mobile app (e.g. Capacitor/PWA)",
          summary: "An existing (or planned) web app packaged to install and run like a mobile app.",
          tradeoffs: "Fastest path if a web app already exists or is planned anyway, but feels and performs less native, especially for anything animation- or gesture-heavy.",
        },
      ],
    },
    {
      id: "phone-app-backend",
      topic: "technology",
      field: "backend",
      question: "Does this app need a backend?",
      whyItMatters: "Whether — and how — the app talks to a server drives most of the remaining technology decisions.",
      recordDecision: {
        title: "Backend approach",
        consequences: "Determines what server-side infrastructure exists (if any) and who's responsible for operating it.",
      },
      options: [
        {
          id: "0",
          label: "No backend — fully local/offline app",
          summary: "All data and logic live on the device; nothing is sent to a server.",
          tradeoffs: "Nothing to host or secure server-side, but no cross-device sync, backup, or multi-user features are possible.",
        },
        {
          id: "1",
          label: "Lightweight backend-as-a-service for sync/accounts (e.g. Supabase, Firebase)",
          summary: "A managed platform provides database, auth, and sync without you running a server.",
          tradeoffs: "Fast to get real accounts and data sync working, at the cost of building against that platform's specific APIs and pricing model.",
          recommended: true,
        },
        {
          id: "2",
          label: "Custom backend API you build and host yourself",
          summary: "You design and run your own server-side API for the app to talk to.",
          tradeoffs: "Full control over data and behavior, but it's effectively a second project (the backend) alongside the app itself.",
        },
      ],
    },
    {
      id: "phone-app-auth",
      topic: "technology",
      field: "authentication",
      question: "How do users sign in?",
      whyItMatters: "Sign-in method affects onboarding friction as much as security — worth matching to how casually people will pick up the app.",
      recordDecision: {
        title: "Mobile sign-in approach",
        consequences: "Determines the onboarding flow and what identity data the app depends on.",
      },
      options: [
        {
          id: "0",
          label: "No accounts needed",
          summary: "The app works without any sign-in at all.",
          tradeoffs: "Zero onboarding friction, but no way to recognize a returning user across devices or reinstalls.",
        },
        {
          id: "1",
          label: "Email/password or social login",
          summary: "Standard account creation, typically via a backend-as-a-service's built-in auth.",
          tradeoffs: "Familiar to most users and well-supported by mobile backend platforms, at the cost of some signup friction.",
          recommended: true,
        },
        {
          id: "2",
          label: "Single sign-on with an existing company identity system",
          summary: "Employees or existing customers log in with credentials they already have.",
          tradeoffs: "No new credentials for users to manage, but only fits when that existing identity system is actually available to integrate with.",
        },
      ],
    },
    {
      id: "phone-app-push",
      topic: "technology",
      field: "thirdPartyServices",
      multi: true,
      question: "Do you need push notifications?",
      whyItMatters: "Push notifications need real infrastructure (a push service, device tokens, a sending mechanism) — worth deciding upfront rather than bolting on later.",
      recordDecision: {
        title: "Push notifications",
        consequences: "Adds a third-party push service dependency and ongoing device-token management if enabled.",
      },
      options: [
        {
          id: "0",
          label: "No push notifications needed",
          summary: "Skip push notifications for now.",
          tradeoffs: "Simplest option, but you lose the most effective re-engagement channel mobile apps have.",
        },
        {
          id: "1",
          label: "Standard push service (e.g. Firebase Cloud Messaging / Apple Push)",
          summary: "Basic push notifications sent through the standard platform services.",
          tradeoffs: "Free and well-supported by most cross-platform frameworks, though you'll build your own sending/targeting logic.",
          recommended: true,
        },
        {
          id: "2",
          label: "Rich in-app messaging/marketing platform (e.g. OneSignal, Braze)",
          summary: "A dedicated platform for push plus in-app messages, segmentation, and campaigns.",
          tradeoffs: "Much richer targeting and messaging tools out of the box, at the cost of a recurring bill and another vendor to integrate.",
        },
      ],
    },
  ],

  "Desktop app": [
    {
      id: "desktop-app-users",
      topic: "requirements",
      field: "users",
      multi: true,
      question: "Who is this app for?",
      whyItMatters: "The audience affects how much you need to worry about installer polish, OS coverage, and support.",
      options: [
        {
          id: "0",
          label: "General public (consumer software)",
          summary: "Anyone can download and install it.",
          tradeoffs: "Needs a polished installer and to support whatever OS versions your audience actually runs, which is more testing surface.",
        },
        {
          id: "1",
          label: "Your own organization's employees (internal tool)",
          summary: "Used only inside your company, on company-managed machines.",
          tradeoffs: "You control the OS/hardware it needs to run on, which removes a lot of compatibility uncertainty.",
          recommended: true,
        },
        {
          id: "2",
          label: "Technical or power users (e.g. a developer tool)",
          summary: "An audience comfortable with command lines, config files, and less hand-holding.",
          tradeoffs: "You can lean on simpler installs (even a plain binary) since polish matters less than capability to this audience.",
        },
        {
          id: "3",
          label: "A specific client or small business",
          summary: "Built for one particular customer's needs rather than a broad audience.",
          tradeoffs: "Requirements can be gathered directly from the one client, but the app is also easy to over-fit to their specific setup.",
        },
      ],
    },
    {
      id: "desktop-app-goal",
      topic: "requirements",
      field: "goals",
      multi: true,
      question: "What's the main goal for this app?",
      whyItMatters: "This determines whether you actually need a desktop app at all, versus a web or mobile app.",
      options: [
        {
          id: "0",
          label: "Work with local files or hardware directly",
          summary: "The app needs real access to the file system, peripherals, or other local resources.",
          tradeoffs: "This is the strongest reason to build a desktop app instead of a web app — browsers can't do most of this.",
          recommended: true,
        },
        {
          id: "1",
          label: "Provide a fast, offline-capable version of a web product",
          summary: "A desktop-installed alternative to an existing (or planned) web app.",
          tradeoffs: "Worth double-checking a web app wouldn't already serve this need before taking on a separate desktop build.",
        },
        {
          id: "2",
          label: "Automate a repetitive workflow",
          summary: "The app exists to script or streamline a task a person currently does by hand.",
          tradeoffs: "Often simple enough to start as a command-line tool before a full GUI is justified.",
        },
        {
          id: "3",
          label: "Provide a GUI over an existing command-line tool or service",
          summary: "Wrapping something that already works, just without a friendly interface.",
          tradeoffs: "The hard logic likely already exists — most of the remaining work is genuinely just the interface.",
        },
      ],
    },
    {
      id: "desktop-app-architecture",
      topic: "architecture",
      field: "style",
      question: "How should this app be built?",
      whyItMatters: "This is the biggest lever on install size, performance, and how many OS-specific builds you maintain.",
      recordDecision: {
        title: "Desktop app build approach",
        consequences: "Determines the language/toolchain for the whole project and how native the app feels on each OS.",
      },
      options: [
        {
          id: "0",
          label: "Native desktop toolkit (e.g. WinForms/WPF, Cocoa/AppKit, Qt/GTK)",
          summary: "Built directly against one platform's native UI toolkit (or a native cross-platform one like Qt).",
          tradeoffs: "Best performance and the most native look/feel, but typically means separate builds (and separate UI code) per OS unless using a toolkit like Qt.",
        },
        {
          id: "1",
          label: "Cross-platform desktop framework (e.g. Electron, Tauri)",
          summary: "Build the UI with web technology, packaged as a desktop app for Windows/Mac/Linux.",
          tradeoffs:
            "Fastest path if you already know web development, and one codebase covers every OS — the tradeoff is larger install size and higher memory use (Electron especially; Tauri is lighter).",
          recommended: true,
        },
        {
          id: "2",
          label: "Cross-platform UI framework compiled natively (e.g. .NET MAUI, Flutter Desktop)",
          summary: "One codebase compiled to a genuinely native app on each platform, rather than running in an embedded browser.",
          tradeoffs: "Better performance and smaller installs than Electron-style tools, but less mature desktop tooling and a smaller community to lean on.",
        },
      ],
    },
    {
      id: "desktop-app-storage",
      topic: "technology",
      field: "database",
      question: "Does it need local data storage?",
      whyItMatters: "Local persistence needs are common for desktop apps but easy to skip planning for until it's urgent.",
      recordDecision: {
        title: "Local data storage",
        consequences: "Determines whether the app has any persistence story at all, and what format that data is kept in.",
      },
      options: [
        {
          id: "0",
          label: "No persistent data needed",
          summary: "The app doesn't need to remember anything between runs.",
          tradeoffs: "Nothing to design or maintain, but confirm this is really true — most apps end up wanting at least user preferences saved.",
        },
        {
          id: "1",
          label: "Embedded local database (e.g. SQLite)",
          summary: "A real database file that lives alongside the app, with no separate server.",
          tradeoffs: "Reliable structured storage with no server to run, at the cost of a bit more setup than a plain settings file.",
          recommended: true,
        },
        {
          id: "2",
          label: "Syncs with a cloud backend/database",
          summary: "Local data is a cache/mirror of data that also lives on a server.",
          tradeoffs: "Enables multi-device access and backup, but now you're also building (or depending on) a backend and a sync strategy.",
        },
      ],
    },
    {
      id: "desktop-app-distribution",
      topic: "technology",
      field: "hosting",
      question: "How will people install and update it?",
      whyItMatters: "Distribution and updates are often underestimated — worth deciding before launch, not after the first bug fix ships.",
      recordDecision: {
        title: "Distribution and update mechanism",
        consequences: "Determines how a fix or new feature actually reaches users after the first release.",
      },
      options: [
        {
          id: "0",
          label: "Manual download from a website",
          summary: "Users download an installer directly; updates mean downloading and reinstalling again.",
          tradeoffs: "Simplest to set up, but users on old versions are common since nothing prompts them to update.",
        },
        {
          id: "1",
          label: "Platform app store (Microsoft Store / Mac App Store)",
          summary: "Distributed and updated through the OS's official store.",
          tradeoffs: "Built-in discovery and update mechanism, at the cost of store review requirements and a revenue cut on paid apps.",
        },
        {
          id: "2",
          label: "Auto-update built into the app (e.g. Squirrel, Sparkle)",
          summary: "The app checks for and installs updates itself, outside any app store.",
          tradeoffs: "Keeps users current without relying on a store, but you're responsible for hosting releases and keeping the update mechanism itself secure.",
          recommended: true,
        },
      ],
    },
    {
      id: "desktop-app-auth",
      topic: "technology",
      field: "authentication",
      question: "Does the app require user accounts?",
      whyItMatters: "Desktop apps often skip accounts entirely — worth confirming that's a deliberate choice, not a default.",
      recordDecision: {
        title: "Account requirement",
        consequences: "Determines whether the app needs any identity/auth system at all, and whether features can assume a signed-in user.",
      },
      options: [
        {
          id: "0",
          label: "No accounts needed — works standalone",
          summary: "The app is fully usable without signing in to anything.",
          tradeoffs: "Simplest option and works fully offline, but rules out any per-user sync or licensing tied to an account.",
          recommended: true,
        },
        {
          id: "1",
          label: "Optional account for syncing or cloud features",
          summary: "The app works standalone, but signing in unlocks sync/backup/cloud features.",
          tradeoffs: "Good of both worlds for users, but means building and maintaining two real modes of operation (signed-in and signed-out).",
        },
        {
          id: "2",
          label: "Required company or SSO login",
          summary: "The app can't be used at all without signing in via an organization's identity system.",
          tradeoffs: "Fits an internal-tool audience well, but makes the app unusable outside that organization's identity setup.",
        },
      ],
    },
  ],
};
