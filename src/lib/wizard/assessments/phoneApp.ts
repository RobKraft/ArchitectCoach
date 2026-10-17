import type { AssessmentCatalog } from "./types";

export const PHONE_APP_ASSESSMENTS: AssessmentCatalog = {
  "phone-app-architecture": {
    // Native (Swift + Kotlin)
    "0": {
      deployment: { complexity: "High", notes: "Two codebases, two build pipelines, two app-store review processes. iOS builds require a Mac." },
      components: { accounts: ["Apple Developer Program", "Google Play Console", "Code-signing certificates and keys", "Crash reporting (e.g. Crashlytics)"], notes: "Signing keys for both stores must be backed up — losing the Android key can block updates." },
      cost: { bucket: "~$10/mo", notes: "Apple charges $99/year (~$8/mo); Google Play is a one-time $25. A Mac and CI build minutes add more." },
      security: "Full access to platform security features (Keychain, Keystore, biometrics). Never ship API secrets inside the app — they can be extracted.",
      scalability: { level: "High", notes: "The app scales with users automatically; the cost of building every feature twice is what doesn't scale." },
      grc: "App Store and Play policies (privacy labels, data-safety forms, account-deletion requirements) apply to both apps separately.",
      auditing: "Unit and UI tests per platform, crash reporting, and staged rollouts in both stores.",
      costMonitoring: "Fixed developer fees; watch CI macOS build minutes, which cost more than Linux.",
      performance: "Best possible — native UI and direct platform APIs.",
    },
    // Cross-platform (React Native, Flutter)
    "1": {
      deployment: { complexity: "Medium", notes: "One codebase, but still two store submissions and native build setup. Services like Expo EAS simplify it." },
      components: { accounts: ["Apple Developer Program", "Google Play Console", "Code-signing certificates and keys", "Build service (e.g. Expo EAS, Codemagic)"], notes: "Over-the-air update services add another account." },
      cost: { bucket: "~$10/mo", notes: "Apple $99/yr and Google Play $25 one-time; cloud build services have free tiers and paid plans from ~$20/mo." },
      security: "Never ship API secrets inside the app bundle — they can be extracted. Third-party plugins bridge to native code — vet and update them.",
      scalability: { level: "High", notes: "Scales with users; one team can ship to both platforms." },
      grc: "App Store and Play policies (privacy labels, data-safety forms, account deletion) apply to both store listings. Over-the-air updates must stay within store rules (no new features bypassing review on iOS).",
      auditing: "One shared test suite plus device testing on both platforms; crash reporting with source maps.",
      costMonitoring: "Watch build-service minutes and OTA update bandwidth.",
      performance: "Near-native for most apps; heavy animation or graphics may need native modules.",
    },
    // Web app wrapped (Capacitor/PWA)
    "2": {
      deployment: { complexity: "Low", notes: "A PWA deploys like a website with no store review. Wrapping it with Capacitor adds store submissions." },
      components: { accounts: ["Web hosting", "Apple Developer Program (if in App Store)", "Google Play Console (if in Play)"], notes: "Store accounts are only needed if you publish to stores." },
      cost: { bucket: "Free", notes: "PWA-only can be free on a static host; store publishing adds the Apple/Google fees." },
      security: "Treat it like a website: HTTPS, a content security policy, no secrets in client code. Web storage is less protected than native secure storage.",
      scalability: { level: "High", notes: "Scales like a website." },
      grc: "Apple may reject apps that are 'just a website' — add real native value. PWAs avoid store policy entirely.",
      auditing: "Web testing tools (Playwright, Lighthouse) plus checks on real devices.",
      costMonitoring: "Watch the web host's bandwidth and plan limits, plus yearly store fees if published to stores.",
      performance: "Fine for forms and content; noticeably less smooth than native for animation-heavy UIs. iOS limits some PWA features.",
    },
  },

  "phone-app-backend": {
    // No backend
    "0": {
      deployment: { complexity: "Low", notes: "Only the app itself to ship." },
      components: { accounts: [], notes: "No server-side accounts." },
      cost: { bucket: "Free", notes: "No server costs." },
      security: "Data stays on the device — use the platform's secure storage for anything sensitive.",
      scalability: { level: "High", notes: "Every user brings their own 'server' — their phone." },
      grc: "Simplest privacy story: you collect nothing. Store privacy labels can truthfully say 'no data collected'.",
      auditing: "Test data migrations between app versions, since you can't fix stored data from a server.",
      costMonitoring: "Nothing to monitor.",
      performance: "Instant — no network calls; works offline.",
    },
    // Backend-as-a-service (Supabase, Firebase)
    "1": {
      deployment: { complexity: "Low", notes: "Configure the service and its security rules; no servers to deploy." },
      components: { accounts: ["BaaS account (e.g. Supabase, Firebase)"], notes: "Usually covers database, auth, file storage, and functions in one account." },
      cost: { bucket: "Free", notes: "Generous free tiers; ~$25/mo paid plans once you outgrow them." },
      security: "Your security rules (Firebase Rules / Supabase row-level security) ARE your access control — a misconfigured rule exposes everyone's data.",
      scalability: { level: "High", notes: "Scales with the vendor; pricing climbs with reads, storage, and bandwidth." },
      grc: "User data lives with the vendor — choose the region, sign the DPA, and support account deletion (required by both app stores).",
      auditing: "Write automated tests for your security rules; use the vendor's logs and usage dashboards.",
      costMonitoring: "Set budget alerts — a bug that reads in a loop can multiply usage-billed costs overnight.",
      performance: "Good; real-time sync and offline caching are often built in.",
    },
    // Custom backend API
    "2": {
      deployment: { complexity: "High", notes: "You build, deploy, and version an API — and old app versions stay in use for months, so the API must stay backward compatible." },
      components: { accounts: ["API hosting", "Database", "Auth provider or your own auth", "Monitoring/error tracking"], notes: "The full stack of a web backend." },
      cost: { bucket: "~$50/mo", notes: "~$10–50/mo for hosting and database at small scale, rising with users." },
      security: "Public API exposed to anyone who unpacks the app: authenticate every call, rate limit, and validate all input.",
      scalability: { level: "High", notes: "Scales as far as you build it to." },
      grc: "You are the data controller: privacy policy, account deletion, data-export requests, and breach response.",
      auditing: "API tests, versioned contracts, and monitoring per API version to see which old app versions are still calling.",
      costMonitoring: "Billing alerts on hosting and database; watch egress from chatty mobile clients.",
      performance: "Depends on your design; mobile networks are slow — keep payloads small and cache on the device.",
    },
  },

  "phone-app-auth": {
    // No accounts
    "0": {
      deployment: { complexity: "Low", notes: "Nothing to deploy." },
      components: { accounts: [], notes: "No extra accounts." },
      cost: { bucket: "Free", notes: "No cost." },
      security: "No credentials to protect. Data can't follow a user to a new phone without accounts.",
      scalability: { level: "High", notes: "Not applicable." },
      grc: "Simplest compliance position — no account-deletion flow required by the stores.",
      auditing: "Nothing to audit.",
      costMonitoring: "Nothing to monitor.",
      performance: "No login step at all.",
    },
    // Email/password or social login
    "1": {
      deployment: { complexity: "Medium", notes: "Configure an auth provider plus deep links for email verification and OAuth redirects on both platforms." },
      components: { accounts: ["Auth provider (Firebase Auth, Supabase, Auth0, etc.)", "Apple Sign in setup", "Google OAuth setup"], notes: "Apple requires 'Sign in with Apple' if you offer other social logins on iOS." },
      cost: { bucket: "Free", notes: "Free up to thousands of monthly active users on most providers." },
      security: "Store tokens in Keychain/Keystore, not plain storage. Use the provider rather than building password handling.",
      scalability: { level: "High", notes: "Scales with the provider." },
      grc: "Both stores require in-app account deletion. Sign the provider's DPA; list the data in privacy labels.",
      auditing: "Test login, logout, token refresh, and account deletion on both platforms; watch the provider's login logs.",
      costMonitoring: "Track monthly active users against the free tier threshold.",
      performance: "Login is a one-time redirect; tokens keep later requests fast.",
    },
    // Single sign-on (company identity)
    "2": {
      deployment: { complexity: "Medium", notes: "Register the app with the company's identity provider (Entra ID, Okta) and configure redirect URIs; often needs mobile device management (MDM) for distribution too." },
      components: { accounts: ["Company identity provider app registration", "MDM or enterprise distribution (often)"], notes: "Coordination with the customer's IT team." },
      cost: { bucket: "Free", notes: "Usually covered by the company's existing identity licenses." },
      security: "Strong: MFA and conditional access come from the company's identity provider. Use the platform's secure browser flows (PKCE).",
      scalability: { level: "High", notes: "Scales with the identity provider." },
      grc: "Fits corporate compliance well; users are deprovisioned centrally when they leave.",
      auditing: "Sign-in logs live in the identity provider; test with accounts that have MFA and conditional access.",
      costMonitoring: "Little direct cost; enterprise MDM may be licensed per device.",
      performance: "Login may involve extra MFA steps; normal requests unaffected.",
    },
  },

  "phone-app-push": {
    // No push
    "0": {
      deployment: { complexity: "Low", notes: "Nothing to deploy." },
      components: { accounts: [], notes: "No extra accounts." },
      cost: { bucket: "Free", notes: "No cost." },
      security: "Nothing to secure.",
      scalability: { level: "High", notes: "Not applicable." },
      grc: "No notification-permission prompts or marketing-consent questions.",
      auditing: "Nothing to audit.",
      costMonitoring: "Nothing to monitor.",
      performance: "No impact.",
    },
    // Standard push (FCM / APNs)
    "1": {
      deployment: { complexity: "Medium", notes: "Configure APNs keys and FCM, store device tokens, and send from a server or function." },
      components: { accounts: ["Firebase project (FCM)", "Apple Push Notification key", "A backend to send from"], notes: "APNs keys must be uploaded to FCM or your sender." },
      cost: { bucket: "Free", notes: "FCM and APNs are free; only your sending backend costs anything." },
      security: "Protect the APNs key and FCM server credentials — whoever has them can message every user. Don't put sensitive data in notification text.",
      scalability: { level: "High", notes: "Handles millions of devices." },
      grc: "Users must opt in; marketing pushes may need consent under privacy and anti-spam laws.",
      auditing: "Log sends and delivery results; clean up invalid tokens; test on real devices (simulators are unreliable for push).",
      costMonitoring: "Free to send; watch your own backend's usage.",
      performance: "Delivery usually takes seconds but isn't guaranteed — never rely on push for critical data.",
    },
    // Rich messaging platform (OneSignal, Braze)
    "2": {
      deployment: { complexity: "Medium", notes: "Install the vendor SDK and connect it to APNs/FCM; marketers can then send without code changes." },
      components: { accounts: ["Messaging platform (e.g. OneSignal, Braze)", "Firebase project", "Apple Push key"], notes: "Often integrates with analytics and CRM tools as well." },
      cost: { bucket: "~$10/mo", notes: "OneSignal has a free tier and paid plans from ~$10–$20/mo; Braze is enterprise-priced ($100+/mo)." },
      security: "The SDK collects device and behavior data — limit what you send it; control who on the team can message all users.",
      scalability: { level: "High", notes: "Built for very large audiences." },
      grc: "Marketing messages need consent and opt-out; the vendor processes user profiles — sign the DPA and disclose it in privacy labels.",
      auditing: "Use the vendor's delivery analytics; send test campaigns to internal devices before real users.",
      costMonitoring: "Pricing is usually by subscriber or message volume — check against the next tier.",
      performance: "SDK adds some app size and startup work; delivery speed similar to standard push.",
    },
  },
};
