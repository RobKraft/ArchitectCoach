# Decisions already made — Phone app

Made in ArchitectCoach's wizard. Treat these as settled (see AGENTS.md, rule 1).
Cost figures are rough monthly ballparks as of October 2026; check current vendor pricing.

**Purpose:** Project 3 purpose

## Who is this app for?

**Chosen:** General consumers (public app store)

Anyone can find and download it from the App Store / Play Store.

**Tradeoffs:** Widest reach, but subject to app-store review policies and ongoing store compliance requirements.

**Alternatives not chosen:** Your own customers (branded companion app); Internal employees or field workers; A small private group (friends, family, a club)

## What's the main goal for this app?

**Chosen:** Provide on-the-go access to a service or content

A mobile-friendly window into something that may also exist on the web.

**Tradeoffs:** Often the case a mobile web app or PWA could also serve well — worth confirming a native/cross-platform app is really needed.

**Alternatives not chosen:** Enable a specific task (e.g. tracking, ordering, booking); Engage users with notifications or community features; Support offline or field use where connectivity is unreliable

## How should this app be built?

**Chosen:** Native (separate Swift/iOS and Kotlin/Android codebases)

Two fully separate apps, each built with the platform's own tools and language.

**Tradeoffs:** Best possible performance and access to every platform feature, at the cost of building and maintaining two codebases in parallel.

**Alternatives not chosen:** Cross-platform framework (e.g. React Native, Flutter); Web app wrapped as a mobile app (e.g. Capacitor/PWA)

### What this means in practice

- **Deployment complexity:** High. Two codebases, two build pipelines, two app-store review processes. iOS builds require a Mac.
- **Accounts & integrations to manage:** Apple Developer Program; Google Play Console; Code-signing certificates and keys; Crash reporting (e.g. Crashlytics). Signing keys for both stores must be backed up — losing the Android key can block updates.
- **Ballpark cost:** ~$10/mo. Apple charges $99/year (~$8/mo); Google Play is a one-time $25. A Mac and CI build minutes add more.
- **Security concerns:** Full access to platform security features (Keychain, Keystore, biometrics). Never ship API secrets inside the app — they can be extracted.
- **Scalability:** High. The app scales with users automatically; the cost of building every feature twice is what doesn't scale.
- **Governance, risk & compliance:** App Store and Play policies (privacy labels, data-safety forms, account-deletion requirements) apply to both apps separately.
- **Auditing for correctness:** Unit and UI tests per platform, crash reporting, and staged rollouts in both stores.
- **Staying on top of costs:** Fixed developer fees; watch CI macOS build minutes, which cost more than Linux.
- **Performance:** Best possible — native UI and direct platform APIs.

## Does this app need a backend?

**Chosen:** No backend — fully local/offline app

All data and logic live on the device; nothing is sent to a server.

**Tradeoffs:** Nothing to host or secure server-side, but no cross-device sync, backup, or multi-user features are possible.

**Alternatives not chosen:** Lightweight backend-as-a-service for sync/accounts (e.g. Supabase, Firebase); Custom backend API you build and host yourself

### What this means in practice

- **Deployment complexity:** Low. Only the app itself to ship.
- **Accounts & integrations to manage:** None. No server-side accounts.
- **Ballpark cost:** Free. No server costs.
- **Security concerns:** Data stays on the device — use the platform's secure storage for anything sensitive.
- **Scalability:** High. Every user brings their own 'server' — their phone.
- **Governance, risk & compliance:** Simplest privacy story: you collect nothing. Store privacy labels can truthfully say 'no data collected'.
- **Auditing for correctness:** Test data migrations between app versions, since you can't fix stored data from a server.
- **Staying on top of costs:** Nothing to monitor.
- **Performance:** Instant — no network calls; works offline.

## How do users sign in?

**Chosen:** No accounts needed

The app works without any sign-in at all.

**Tradeoffs:** Zero onboarding friction, but no way to recognize a returning user across devices or reinstalls.

**Alternatives not chosen:** Email/password or social login; Single sign-on with an existing company identity system

### What this means in practice

- **Deployment complexity:** Low. Nothing to deploy.
- **Accounts & integrations to manage:** None. No extra accounts.
- **Ballpark cost:** Free. No cost.
- **Security concerns:** No credentials to protect. Data can't follow a user to a new phone without accounts.
- **Scalability:** High. Not applicable.
- **Governance, risk & compliance:** Simplest compliance position — no account-deletion flow required by the stores.
- **Auditing for correctness:** Nothing to audit.
- **Staying on top of costs:** Nothing to monitor.
- **Performance:** No login step at all.

## Do you need push notifications?

**Chosen:** No push notifications needed

Skip push notifications for now.

**Tradeoffs:** Simplest option, but you lose the most effective re-engagement channel mobile apps have.

**Alternatives not chosen:** Standard push service (e.g. Firebase Cloud Messaging / Apple Push); Rich in-app messaging/marketing platform (e.g. OneSignal, Braze)

### What this means in practice

- **Deployment complexity:** Low. Nothing to deploy.
- **Accounts & integrations to manage:** None. No extra accounts.
- **Ballpark cost:** Free. No cost.
- **Security concerns:** Nothing to secure.
- **Scalability:** High. Not applicable.
- **Governance, risk & compliance:** No notification-permission prompts or marketing-consent questions.
- **Auditing for correctness:** Nothing to audit.
- **Staying on top of costs:** Nothing to monitor.
- **Performance:** No impact.

## Changes after the wizard

_Record any decision changed during spec/plan work here: what changed, why, and what it affects._
