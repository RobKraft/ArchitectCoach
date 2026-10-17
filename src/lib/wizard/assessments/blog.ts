import type { AssessmentCatalog } from "./types";

export const BLOG_ASSESSMENTS: AssessmentCatalog = {
  "blog-build-approach": {
    // Markdown files in a static site generator
    "0": {
      deployment: { complexity: "Low", notes: "Write a Markdown file, commit, push — the host rebuilds and publishes." },
      components: { accounts: ["Git repository (e.g. GitHub)", "Hosting account", "Domain registrar"], notes: "Posts live in the repo; no separate content system." },
      cost: { bucket: "Free", notes: "Open-source tooling; you only pay for hosting and the domain." },
      security: "No admin login to attack — publishing access equals repo access, so protect the git account with 2FA.",
      scalability: { level: "High", notes: "Serves any traffic. Builds slow down past a few thousand posts on some generators (Hugo stays fast)." },
      grc: "Full ownership of your content in plain files — no vendor lock-in or export problem. Check theme licenses.",
      auditing: "Every post change is a git commit (full history). Add a link checker and an RSS validator to the build.",
      costMonitoring: "Nothing to monitor beyond the host's build minutes.",
      performance: "Excellent — pre-rendered pages with little JavaScript.",
    },
    // Headless CMS + SSG
    "1": {
      deployment: { complexity: "Medium", notes: "Two systems to wire: the CMS triggers a rebuild through a webhook whenever someone publishes." },
      components: { accounts: ["Headless CMS (e.g. Contentful, Sanity)", "Git repository", "Hosting account", "Domain registrar"], notes: "Plus API keys and a rebuild webhook to manage between them." },
      cost: { bucket: "Free", notes: "Free tiers cover a solo blog. Team features jump fast: Sanity ~$15/seat/mo, Contentful's paid tier is ~$300/mo." },
      security: "CMS API tokens must stay server/build-side only. Writers' CMS accounts need 2FA and the least access they need.",
      scalability: { level: "High", notes: "The site still serves static files; CMS API rate limits only matter at build time." },
      grc: "Content lives in a vendor's database — check export options and where the data is hosted. Your writers' accounts are personal data held by the vendor.",
      auditing: "CMS version history shows who changed what; check that the publish webhook actually triggers a rebuild (failed builds are easy to miss).",
      costMonitoring: "Watch seat count, API calls, and asset bandwidth against the free tier's limits.",
      performance: "Excellent for readers (static output). Builds take longer because they fetch content over the API.",
    },
    // All-in-one platform (WordPress, Ghost)
    "2": {
      deployment: { complexity: "Medium", notes: "Self-hosted means running a server, a database, and updates. Managed hosting removes most of that." },
      components: { accounts: ["Platform/hosting account", "Database (if self-hosted)", "Domain registrar", "Plugins/themes"], notes: "Plugins often bring their own vendor accounts and licenses." },
      cost: { bucket: "~$10/mo", notes: "Managed WordPress/Ghost runs ~$5–25/mo; premium themes and plugins add more." },
      security: "WordPress is the most-attacked platform on the web: plugins and its admin login need constant updates and hardening. Ghost has a smaller attack surface.",
      scalability: { level: "Medium", notes: "Needs caching or a CDN to survive traffic spikes; database-backed pages are heavier than static files." },
      grc: "Comments, newsletters, and member signups collect personal data — needs a privacy policy and data-deletion process. Plugin licenses vary.",
      auditing: "Turn on automatic security updates, use an activity-log plugin, and test backups by actually restoring one.",
      costMonitoring: "Watch renewal pricing and how plugin subscriptions add up; set billing alerts if self-hosting.",
      performance: "Good with caching, slow without it. Heavy themes and plugins are the usual cause of slowness.",
    },
  },

  "blog-hosting": {
    // GitHub Pages
    "0": {
      deployment: { complexity: "Low", notes: "Push to deploy; HTTPS and custom domains included." },
      components: { accounts: ["GitHub account", "Domain registrar"], notes: "Code, content, and hosting in one place." },
      cost: { bucket: "Free", notes: "Free for public repos." },
      security: "Free HTTPS; protect the GitHub account with 2FA. No custom security headers.",
      scalability: { level: "Medium", notes: "~100 GB/month soft bandwidth limit — plenty for most personal blogs." },
      grc: "Not for commercial-transaction sites. Drafts in a public repo are publicly visible — keep drafts in a branch or a private repo.",
      auditing: "Git history is your audit trail; the Actions log records each publish.",
      costMonitoring: "Nothing to monitor.",
      performance: "Good: GitHub's CDN serves static files quickly.",
    },
    // Netlify
    "1": {
      deployment: { complexity: "Low", notes: "Git-push deploys plus preview URLs to review a post before it goes live." },
      components: { accounts: ["Netlify account", "Git repository", "Domain registrar"], notes: "Netlify Forms can handle a newsletter signup without another service." },
      cost: { bucket: "Free", notes: "Free tier fits most blogs; Pro ~$19/member/mo." },
      security: "Free HTTPS and configurable security headers.",
      scalability: { level: "High", notes: "Global CDN; free-tier bandwidth limits apply." },
      grc: "Check the DPA for EU readers, especially if you use Netlify Forms to collect emails.",
      auditing: "Deploy log and one-click rollback.",
      costMonitoring: "Set usage notifications — a viral post can exhaust free bandwidth.",
      performance: "Excellent.",
    },
    // Vercel
    "2": {
      deployment: { complexity: "Low", notes: "Git-push deploys with previews; best fit if the blog is built with Next.js." },
      components: { accounts: ["Vercel account", "Git repository", "Domain registrar"], notes: "Optional built-in analytics." },
      cost: { bucket: "Free", notes: "Hobby is free but non-commercial; a monetized blog needs Pro (~$20/member/mo)." },
      security: "Free HTTPS, configurable headers, deployment protection.",
      scalability: { level: "High", notes: "Edge network absorbs viral spikes; usage-billed beyond the included amounts." },
      grc: "Ads, sponsorships, or paid content count as commercial — that rules out the Hobby plan.",
      auditing: "Deployment history with instant rollback.",
      costMonitoring: "Set a spend cap on Pro.",
      performance: "Excellent.",
    },
    // Managed platform hosting (WordPress.com, Ghost(Pro))
    "3": {
      deployment: { complexity: "Low", notes: "No deploy step — write in the browser and click Publish." },
      components: { accounts: ["Platform account (WordPress.com / Ghost(Pro))", "Domain registrar"], notes: "Newsletter, comments, and memberships are often built in, which avoids extra vendors." },
      cost: { bucket: "~$10/mo", notes: "~$4–25/mo depending on plan; plugins or custom themes often require higher tiers." },
      security: "The platform patches and secures everything; you manage the user accounts and 2FA.",
      scalability: { level: "High", notes: "The platform handles traffic; plan tiers may cap members or newsletter sends." },
      grc: "Your content and subscriber list live with the vendor — confirm you can export both. The vendor is the data processor for reader emails.",
      auditing: "Use the platform's revision history; check that scheduled posts and newsletter sends actually went out.",
      costMonitoring: "Price tiers are usually by member/subscriber count — watch the next tier's threshold.",
      performance: "Good; managed caching and CDN are included.",
    },
  },

  "blog-comments": {
    // No comments
    "0": {
      deployment: { complexity: "Low", notes: "Nothing to deploy." },
      components: { accounts: [], notes: "No extra accounts." },
      cost: { bucket: "Free", notes: "No cost." },
      security: "No user-generated content, so no spam or abuse to moderate.",
      scalability: { level: "High", notes: "Not applicable." },
      grc: "No reader data collected and no moderation obligations.",
      auditing: "Nothing to audit.",
      costMonitoring: "Nothing to monitor.",
      performance: "Best — no comment widget to load.",
    },
    // Lightweight third-party (giscus, Disqus)
    "1": {
      deployment: { complexity: "Low", notes: "Add an embed script to your post template." },
      components: { accounts: ["Comment service (giscus uses GitHub Discussions; Disqus has its own account)"], notes: "Readers also need an account with that service to comment." },
      cost: { bucket: "Free", notes: "giscus is free. Disqus is free with ads; ad-free plans start ~$11/mo." },
      security: "Spam and abuse moderation become your job. The embed is a third-party script on your pages.",
      scalability: { level: "High", notes: "The vendor handles the load." },
      grc: "Disqus's free tier serves ads and tracks readers — needs consent handling in the EU. giscus stores comments publicly on GitHub.",
      auditing: "Check moderation queues regularly; make sure comments load on a sample of old posts after theme changes.",
      costMonitoring: "Free tiers usually stay free; watch for changes to Disqus's plans.",
      performance: "giscus is light; Disqus adds noticeable weight from ads and trackers. Lazy-load either below the fold.",
    },
    // Full custom comments (backend + DB)
    "2": {
      deployment: { complexity: "High", notes: "Turns a static blog into an app: an API, a database, migrations, and a server or functions to deploy." },
      components: { accounts: ["API hosting / serverless functions", "Database", "Spam filtering (e.g. Akismet)", "Email for notifications"], notes: "Several new services where before there were none." },
      cost: { bucket: "~$10/mo", notes: "~$0–25/mo on free-tier databases and functions; grows with traffic and spam volume." },
      security: "You own input sanitization (XSS), spam, rate limiting, auth, and protecting stored emails. This is the riskiest option.",
      scalability: { level: "Medium", notes: "Depends entirely on what you build; a database-backed write path needs real capacity planning." },
      grc: "You become the data controller for reader names and emails: privacy policy, deletion requests, and possibly content-moderation obligations.",
      auditing: "Needs automated tests for the API, error monitoring, and checked database backups.",
      costMonitoring: "Billing alerts on the database and functions; spam bots can drive up usage-based costs.",
      performance: "Depends on implementation; load comments asynchronously so they don't slow the page itself.",
    },
  },
};
