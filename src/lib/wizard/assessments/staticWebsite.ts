import type { AssessmentCatalog } from "./types";

export const STATIC_WEBSITE_ASSESSMENTS: AssessmentCatalog = {
  "static-website-build-approach": {
    // Plain HTML, CSS, and JavaScript
    "0": {
      deployment: {
        complexity: "Low",
        notes: "No build step — upload the files and you're done. Any host that serves files works.",
      },
      components: {
        accounts: ["Hosting account", "Domain registrar"],
        notes: "Nothing beyond where the files live and the domain name.",
      },
      cost: { bucket: "Free", notes: "The tooling costs nothing; you only pay for hosting and the domain (~$1/mo averaged)." },
      security: "Smallest possible attack surface: no server code, no dependencies to patch. Main risks are leaked hosting credentials and any third-party scripts you paste in.",
      scalability: {
        level: "High",
        notes: "Traffic scales as well as your host does. What doesn't scale is authoring — shared headers/footers get copy-pasted into every page past ~10 pages.",
      },
      grc: "Few concerns. Add a privacy notice if you add analytics or forms, and keep license notices for any copied CSS/JS.",
      auditing: "Run an HTML validator and a broken-link checker before each upload; check pages with Lighthouse for accessibility.",
      costMonitoring: "Nothing to monitor here — the cost lives with the hosting choice.",
      performance: "Excellent by default: no framework JavaScript to download. Optimize images and you'll score near-perfect.",
    },
    // Static site generator (Eleventy, Hugo, Jekyll)
    "1": {
      deployment: {
        complexity: "Low",
        notes: "One build command produces a folder of files. Most hosts run the build for you on every git push.",
      },
      components: {
        accounts: ["Git repository (e.g. GitHub)", "Hosting account", "Domain registrar"],
        notes: "Adds a git repo, which most hosts connect to for automatic builds.",
      },
      cost: { bucket: "Free", notes: "Generators are open source. Build minutes are free at this size on every major host." },
      security: "Output is still plain files, so the live site has almost nothing to attack. Build-time npm/gem dependencies can carry supply-chain risk — pin versions and use Dependabot.",
      scalability: {
        level: "High",
        notes: "Serves any traffic a CDN can. Builds slow down past a few thousand pages (Hugo stays fast; Jekyll gets slow).",
      },
      grc: "Check the theme's license if you use one. Same privacy-notice needs as any site that adds analytics or forms.",
      auditing: "Fail the build on broken internal links (most generators have a plugin), and use the host's deploy previews to review changes before they go live.",
      costMonitoring: "Watch the host's build-minute usage if you rebuild very often; otherwise nothing.",
      performance: "Excellent — output is pre-rendered HTML with little or no JavaScript.",
    },
    // Component framework static export (Next.js/Astro)
    "2": {
      deployment: {
        complexity: "Medium",
        notes: "A build step plus framework config (static export mode, image handling, base paths). More things can break between versions.",
      },
      components: {
        accounts: ["Git repository (e.g. GitHub)", "Hosting account", "Domain registrar"],
        notes: "A git repo connected to the host for automatic builds, with a larger npm dependency tree to keep updated.",
      },
      cost: { bucket: "Free", notes: "Free tooling. Build times are longer, but still well within free build minutes for small sites." },
      security: "The live site is still static, but the dependency tree is hundreds of npm packages. Keep them updated and avoid exposing secrets in client-side environment variables.",
      scalability: {
        level: "High",
        notes: "Serves any traffic. The main benefit is that you can later switch to server rendering without rewriting components.",
      },
      grc: "Watch for framework features that quietly assume a server or a specific vendor (e.g. image optimization) — it's a lock-in risk, not a compliance one.",
      auditing: "Add a few component tests plus a link checker in CI; compare Lighthouse scores before and after framework upgrades.",
      costMonitoring: "Nothing beyond hosting. Watch for accidentally using features that need a paid server runtime.",
      performance: "Very good, but ships more JavaScript than a plain generator. Astro ships near-zero JS by default; Next.js ships React's runtime.",
    },
  },

  "static-website-hosting": {
    // GitHub Pages
    "0": {
      deployment: { complexity: "Low", notes: "Push to a branch or run a GitHub Actions workflow; HTTPS and custom domains are built in." },
      components: { accounts: ["GitHub account", "Domain registrar"], notes: "Code and hosting live in the same account." },
      cost: { bucket: "Free", notes: "Free for public repos. Private-repo Pages needs a paid GitHub plan (~$4/mo)." },
      security: "Free HTTPS. Turn on 2FA for GitHub — whoever controls the repo controls the site. No custom security headers (e.g. CSP) are possible.",
      scalability: { level: "Medium", notes: "Soft limits: ~100 GB/month bandwidth and a 1 GB site size. Not meant for commercial, high-traffic sites." },
      grc: "GitHub's terms discourage using Pages mainly for commercial transactions. Content in a public repo is visible to everyone.",
      auditing: "The Actions log shows each deploy; every change is a git commit, so you get a full audit trail automatically.",
      costMonitoring: "Nothing to monitor — no usage billing.",
      performance: "Good: served from GitHub's CDN. Less control over caching than Netlify/Vercel.",
    },
    // Netlify
    "1": {
      deployment: { complexity: "Low", notes: "Connect a git repo; every push builds and deploys, and every PR gets a preview URL." },
      components: { accounts: ["Netlify account", "Git repository", "Domain registrar"], notes: "Built-in forms and functions can replace other services if you need them later." },
      cost: { bucket: "Free", notes: "Free tier covers most small sites. Pro is ~$19 per team member per month once you need more." },
      security: "Free HTTPS, configurable security headers, and password-protected deploy previews on paid plans.",
      scalability: { level: "High", notes: "Global CDN. The free tier has bandwidth/build-credit limits; past them the site pauses or you upgrade." },
      grc: "Netlify is a US company; check its DPA if visitors are in the EU. Free-tier usage is subject to fair-use terms.",
      auditing: "Deploy log and one-click rollback to any previous deploy; deploy previews let someone review before merging.",
      costMonitoring: "Set usage notifications in team settings — overages (bandwidth, form submissions, function calls) are where surprise bills come from.",
      performance: "Excellent for static files; fast global CDN with sensible cache defaults.",
    },
    // Vercel
    "2": {
      deployment: { complexity: "Low", notes: "Connect a git repo; every push builds and deploys with preview URLs. Especially good support for Next.js." },
      components: { accounts: ["Vercel account", "Git repository", "Domain registrar"], notes: "Built-in analytics and serverless functions are available as add-ons." },
      cost: { bucket: "Free", notes: "The Hobby plan is free but non-commercial only. A business site needs Pro (~$20 per member per month)." },
      security: "Free HTTPS, configurable headers, deployment protection for previews. Keep team access tight — anyone with access can deploy.",
      scalability: { level: "High", notes: "Global edge network handles traffic spikes easily; usage-based billing above the included amounts." },
      grc: "The Hobby plan's non-commercial rule is a compliance issue in itself for a business site. Check the DPA for EU visitors.",
      auditing: "Deployment history with instant rollback; preview URLs per branch for review.",
      costMonitoring: "Enable spend management and set a hard spending cap on Pro — function or bandwidth overages are the usual surprise.",
      performance: "Excellent; fast edge CDN with framework-aware caching.",
    },
    // Traditional web hosting (shared/VPS)
    "3": {
      deployment: { complexity: "Medium", notes: "Usually FTP/SFTP upload or a script you write; no automatic deploy on git push unless you set it up." },
      components: { accounts: ["Hosting provider account", "Domain registrar", "SSL certificate (often bundled)"], notes: "On a VPS you also own the operating system and web server." },
      cost: { bucket: "~$10/mo", notes: "Shared hosting runs ~$3–10/mo; a small VPS ~$5–12/mo. Intro prices often double on renewal." },
      security: "On a VPS, you must patch the OS, harden SSH, and renew certificates yourself. Shared hosting is patched for you but shares a server with strangers.",
      scalability: { level: "Medium", notes: "One server in one region. Fine for normal traffic; a viral spike can take it down without a CDN in front." },
      grc: "You choose the data-center region, which helps with data-residency requirements. On a VPS, keeping the server patched is your responsibility.",
      auditing: "Keep the site in git and deploy from it, rather than editing on the server, so you always know what's live. Add uptime monitoring.",
      costMonitoring: "Fixed monthly price — put the renewal date on the calendar, since renewal price hikes are common.",
      performance: "Good in the server's region, slower far away. Put a free CDN (e.g. Cloudflare) in front for global visitors.",
    },
  },

  "static-website-analytics": {
    // No analytics
    "0": {
      deployment: { complexity: "Low", notes: "Nothing to deploy." },
      components: { accounts: [], notes: "No extra accounts." },
      cost: { bucket: "Free", notes: "No cost." },
      security: "No third-party script on your pages — nothing that could be compromised to inject code.",
      scalability: { level: "High", notes: "Not applicable — nothing to scale." },
      grc: "Simplest compliance position: no tracking, no cookie banner needed for analytics.",
      auditing: "Your host may still show basic request counts if you need a rough sense of traffic.",
      costMonitoring: "Nothing to monitor.",
      performance: "Best possible — no extra script to load.",
    },
    // Privacy-friendly analytics (Plausible, Fathom)
    "1": {
      deployment: { complexity: "Low", notes: "Add one script tag to your page template." },
      components: { accounts: ["Analytics vendor account (e.g. Plausible, Fathom)"], notes: "One more account to keep paid and secured." },
      cost: { bucket: "~$10/mo", notes: "~$9–15/mo for small traffic; priced by monthly pageviews. Plausible can be self-hosted for free." },
      security: "A third-party script runs on every page. Choose a reputable vendor and consider loading it through your own domain.",
      scalability: { level: "High", notes: "The vendor handles scale; cost rises with pageviews." },
      grc: "Cookie-free and designed to need no consent banner under GDPR. Still mention it in your privacy notice.",
      auditing: "Compare its numbers against your host's request logs occasionally; set up goal tracking to confirm events fire.",
      costMonitoring: "Plans are pageview tiers — check usage monthly so a traffic spike doesn't bump you up a tier unexpectedly.",
      performance: "Negligible impact: the script is under ~1 KB.",
    },
    // Google Analytics
    "2": {
      deployment: { complexity: "Low", notes: "Add the tag; setting up GA4 events and reports properly takes longer than installing it." },
      components: { accounts: ["Google account (Analytics property)", "Cookie-consent tool (if you have EU visitors)"], notes: "Usually also implies a consent-banner service." },
      cost: { bucket: "Free", notes: "Free. A consent-management tool may cost ~$0–10/mo." },
      security: "A large third-party script on every page. Grant property access per person, not via shared logins.",
      scalability: { level: "High", notes: "Handles any traffic; data sampling kicks in for very large reports." },
      grc: "Uses cookies and personal data: needs a consent banner for EU/UK visitors, a privacy-policy disclosure, and data-retention settings. Some EU regulators have challenged its use.",
      auditing: "Use GA4's DebugView to confirm events fire; check that consent mode actually blocks tracking before consent.",
      costMonitoring: "Free, but count the time cost of consent management and reporting setup.",
      performance: "Adds ~50–100 KB of script; minor but measurable impact on load time.",
    },
  },
};
