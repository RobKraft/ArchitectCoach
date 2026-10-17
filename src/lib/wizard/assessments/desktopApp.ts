import type { AssessmentCatalog } from "./types";

export const DESKTOP_APP_ASSESSMENTS: AssessmentCatalog = {
  "desktop-app-architecture": {
    // Native toolkit (WinForms/WPF, Cocoa, Qt/GTK)
    "0": {
      deployment: { complexity: "Medium", notes: "Build an installer per operating system; supporting more than one OS means separate builds (and separate code for WPF/Cocoa)." },
      components: { accounts: ["Code-signing certificate (Windows)", "Apple Developer Program (Mac signing and notarization)"], notes: "Unsigned apps trigger scary OS warnings." },
      cost: { bucket: "~$10/mo", notes: "Windows signing ~$10/mo via Azure Trusted Signing (or a ~$200–400/yr certificate); Apple is $99/yr. Qt commercial licenses cost much more." },
      security: "Direct OS access — validate any files or input you load, and sign your binaries so users can verify they're yours.",
      scalability: { level: "High", notes: "Runs on each user's machine. Supporting more operating systems is the real cost." },
      grc: "Check the toolkit's license (Qt is LGPL/commercial). Most enterprises require signed installers.",
      auditing: "Unit tests plus UI automation (e.g. WinAppDriver); crash reporting so you see failures in the field.",
      costMonitoring: "Fixed yearly signing fees — calendar the renewals; an expired certificate breaks new installs.",
      performance: "Best: small memory footprint and fast startup.",
    },
    // Cross-platform (Electron, Tauri)
    "1": {
      deployment: { complexity: "Medium", notes: "One codebase, but signing and notarizing for Windows and Mac plus per-OS installers. Tools like electron-builder automate it." },
      components: { accounts: ["Code-signing certificate (Windows)", "Apple Developer Program", "CI with Mac and Windows runners"], notes: "Release hosting for installers (e.g. GitHub Releases)." },
      cost: { bucket: "~$10/mo", notes: "Windows signing ~$10/mo (Azure Trusted Signing) and Apple's $99/yr; Mac CI minutes cost more than Linux." },
      security: "Electron needs care: turn off Node integration in renderers, use context isolation, keep Electron updated (it bundles Chromium). Tauri is safer by default.",
      scalability: { level: "High", notes: "One team ships to all desktop operating systems." },
      grc: "Electron bundles Chromium — you're responsible for shipping its security patches promptly.",
      auditing: "Playwright can test Electron apps end to end; add crash reporting and check signed builds on clean machines.",
      costMonitoring: "Signing renewals and CI minutes.",
      performance: "Electron uses 100+ MB of memory and installers of ~100 MB; Tauri is much lighter (~10 MB) because it uses the OS's web view.",
    },
    // Cross-platform native UI (.NET MAUI, Flutter Desktop)
    "2": {
      deployment: { complexity: "Medium", notes: "One codebase with per-OS builds and installers; desktop support is younger than mobile support in both frameworks." },
      components: { accounts: ["Code-signing certificate (Windows)", "Apple Developer Program", "CI with Mac and Windows runners"], notes: "Signing is needed on every OS to avoid security warnings." },
      cost: { bucket: "~$10/mo", notes: "Free frameworks; same signing fees." },
      security: "Compiled code with a smaller dependency surface than Electron; still sign binaries and validate input.",
      scalability: { level: "High", notes: "Shares code with mobile apps if you have them." },
      grc: "Check that the framework's desktop support is considered stable for your target OS versions.",
      auditing: "Unit tests plus testing on each OS — platform-specific bugs are more common in younger desktop targets.",
      costMonitoring: "Signing renewals and CI minutes.",
      performance: "Good — native compilation, lighter than Electron.",
    },
  },

  "desktop-app-storage": {
    // No persistent data
    "0": {
      deployment: { complexity: "Low", notes: "Nothing extra to deploy." },
      components: { accounts: [], notes: "No extra accounts." },
      cost: { bucket: "Free", notes: "No cost." },
      security: "Nothing stored to protect.",
      scalability: { level: "High", notes: "Not applicable." },
      grc: "No data retention concerns.",
      auditing: "Nothing to audit.",
      costMonitoring: "Nothing to monitor.",
      performance: "No impact.",
    },
    // Embedded local database (SQLite)
    "1": {
      deployment: { complexity: "Low", notes: "The database ships inside the app; you need a schema-upgrade step that runs when the app updates." },
      components: { accounts: [], notes: "No service to manage." },
      cost: { bucket: "Free", notes: "No cost." },
      security: "Data sits on the user's disk — encrypt sensitive data (e.g. SQLCipher) and store it in the user's profile folder.",
      scalability: { level: "Medium", notes: "Great for one user's data; no sharing between devices or users." },
      grc: "Data never leaves the user's machine — a strong privacy position. Users are responsible for their own backups unless you add export.",
      auditing: "Test schema upgrades from every older version you've shipped; add an integrity check on startup.",
      costMonitoring: "Nothing to monitor.",
      performance: "Very fast — local disk, no network.",
    },
    // Syncs with a cloud backend
    "2": {
      deployment: { complexity: "High", notes: "A backend to deploy and version, plus sync and conflict resolution in the app — the hardest part to get right." },
      components: { accounts: ["Backend hosting or BaaS", "Cloud database", "Auth provider"], notes: "Effectively a web backend alongside the desktop app." },
      cost: { bucket: "~$10/mo", notes: "~$0–25/mo on BaaS free tiers; rises with users and storage." },
      security: "Encrypt in transit, authenticate every sync call, and protect local cached copies too.",
      scalability: { level: "High", notes: "Scales with the backend you choose." },
      grc: "You now hold user data in the cloud: privacy policy, region choice, deletion requests, and the vendor's DPA.",
      auditing: "Test conflict scenarios (offline edits on two devices); log sync failures centrally.",
      costMonitoring: "Billing alerts on backend and storage; watch for sync loops that re-upload data.",
      performance: "Local-first sync feels instant; naive 'always fetch from server' designs feel slow.",
    },
  },

  "desktop-app-distribution": {
    // Manual download
    "0": {
      deployment: { complexity: "Low", notes: "Build installers and upload them to a website or GitHub Releases." },
      components: { accounts: ["Download hosting (website or GitHub Releases)", "Code-signing certificates"], notes: "Signing is still needed to avoid OS warnings." },
      cost: { bucket: "~$10/mo", notes: "Hosting is cheap or free; signing is the main cost." },
      security: "Users must trust your download page — serve over HTTPS, sign installers, and publish checksums.",
      scalability: { level: "Medium", notes: "Downloads scale fine; getting users to update does not — many stay on old versions." },
      grc: "Old versions in the field may have known vulnerabilities you can't force-patch.",
      auditing: "Track which versions are in use (e.g. via crash reports) to know how many are outdated.",
      costMonitoring: "Watch bandwidth if installers are large and hosted on metered storage.",
      performance: "No runtime impact.",
    },
    // Platform app store
    "1": {
      deployment: { complexity: "Medium", notes: "Store packaging (MSIX / Mac App Store), review processes, and sandboxing rules." },
      components: { accounts: ["Microsoft Partner Center", "Apple Developer Program"], notes: "Each store has its own listing, review, and policy requirements." },
      cost: { bucket: "~$10/mo", notes: "Microsoft Store registration is free for individuals; Apple is $99/yr. Stores take a cut of paid apps." },
      security: "The store signs and scans apps; Mac App Store sandboxing limits what the app can access.",
      scalability: { level: "High", notes: "Store handles distribution and updates for any number of users." },
      grc: "Store policies govern privacy disclosures and in-app payments; sandbox limits may block some features.",
      auditing: "Store dashboards show installs, crashes, and ratings.",
      costMonitoring: "Fixed fees; revenue share on paid apps.",
      performance: "No runtime impact; sandboxing can slightly restrict file access.",
    },
    // Built-in auto-update (Squirrel, Sparkle)
    "2": {
      deployment: { complexity: "Medium", notes: "Publish signed updates to an update feed; the app checks and installs them. Needs a careful release process." },
      components: { accounts: ["Update feed hosting (e.g. GitHub Releases, S3)", "Code-signing certificates"], notes: "Signing keys for updates must be guarded closely." },
      cost: { bucket: "~$10/mo", notes: "Signing plus small hosting costs; bandwidth grows with users × update size." },
      security: "A compromised update channel can push malware to every user — sign updates, verify signatures, and serve only over HTTPS.",
      scalability: { level: "High", notes: "Most users stay on the latest version automatically." },
      grc: "Tell users the app updates automatically; enterprises may want to control the timing.",
      auditing: "Stage rollouts and watch crash rates before releasing to everyone; keep the ability to pull a bad release.",
      costMonitoring: "Monitor bandwidth on the update feed — every release is downloaded by every user.",
      performance: "Downloads in the background; small runtime cost.",
    },
  },

  "desktop-app-auth": {
    // No accounts
    "0": {
      deployment: { complexity: "Low", notes: "Nothing to deploy." },
      components: { accounts: [], notes: "No extra accounts." },
      cost: { bucket: "Free", notes: "No cost." },
      security: "No credentials to protect.",
      scalability: { level: "High", notes: "Not applicable." },
      grc: "No personal data collected for accounts.",
      auditing: "Nothing to audit.",
      costMonitoring: "Nothing to monitor.",
      performance: "No login step.",
    },
    // Optional account for sync/cloud features
    "1": {
      deployment: { complexity: "Medium", notes: "An auth provider plus a login flow through the system browser that returns to the app." },
      components: { accounts: ["Auth provider (e.g. Auth0, Supabase Auth)"], notes: "Plus whatever cloud backend the account unlocks." },
      cost: { bucket: "Free", notes: "Free tiers cover thousands of monthly active users." },
      security: "Store tokens in the OS credential store (Windows Credential Manager, macOS Keychain), not in config files.",
      scalability: { level: "High", notes: "Scales with the provider." },
      grc: "Account holders' data falls under privacy law; offer account deletion; sign the provider's DPA.",
      auditing: "Test the app both signed in and signed out — the offline path is easy to break.",
      costMonitoring: "Track monthly active users against the free tier.",
      performance: "Login only when needed; the app keeps working offline.",
    },
    // Required company/SSO login
    "2": {
      deployment: { complexity: "Medium", notes: "Register the app with the company's identity provider (Entra ID, Okta) and handle token refresh and offline behavior." },
      components: { accounts: ["Company identity provider app registration"], notes: "Coordination with the customer's IT team." },
      cost: { bucket: "Free", notes: "Usually covered by existing identity licenses." },
      security: "Strong: MFA and conditional access come from the identity provider. Use the system browser with PKCE, not embedded login forms.",
      scalability: { level: "High", notes: "Scales with the identity provider." },
      grc: "Fits corporate compliance well — central deprovisioning and sign-in logs.",
      auditing: "Sign-in logs live in the identity provider; test what happens when a token expires while offline.",
      costMonitoring: "Little direct cost.",
      performance: "Login may involve MFA; normal use unaffected.",
    },
  },
};
