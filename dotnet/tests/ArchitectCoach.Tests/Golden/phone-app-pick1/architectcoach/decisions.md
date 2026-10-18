# Decisions already made — Phone app

Made in ArchitectCoach's wizard. Treat these as settled (see AGENTS.md, rule 1).
Cost figures are rough monthly ballparks as of October 2026; check current vendor pricing.

**Purpose:** Team's "booking" site & admin <beta>

## Who is this app for?

**Chosen:** Your own customers (branded companion app)

An app tied to an existing product or service, used by people who already have an account with you.

**Tradeoffs:** Usually needs to talk to your existing backend/accounts system rather than starting from a blank slate.

**Alternatives not chosen:** General consumers (public app store); Internal employees or field workers; A small private group (friends, family, a club)

## What's the main goal for this app?

**Chosen:** Enable a specific task (e.g. tracking, ordering, booking)

The app exists to make one core workflow fast and convenient on a phone.

**Tradeoffs:** Keeping scope tight to that one task is what makes a mobile app feel good — resist adding unrelated features.

**Alternatives not chosen:** Provide on-the-go access to a service or content; Engage users with notifications or community features; Support offline or field use where connectivity is unreliable

## How should this app be built?

**Chosen:** Cross-platform framework (e.g. React Native, Flutter)

One codebase that compiles to both iOS and Android apps.

**Tradeoffs:** Much less duplicated work than native, and still gives good access to native features — the most common right default for a new app.

**Alternatives not chosen:** Native (separate Swift/iOS and Kotlin/Android codebases); Web app wrapped as a mobile app (e.g. Capacitor/PWA)

### What this means in practice

- **Deployment complexity:** Medium. One codebase, but still two store submissions and native build setup. Services like Expo EAS simplify it.
- **Accounts & integrations to manage:** Apple Developer Program; Google Play Console; Code-signing certificates and keys; Build service (e.g. Expo EAS, Codemagic). Over-the-air update services add another account.
- **Ballpark cost:** ~$10/mo. Apple $99/yr and Google Play $25 one-time; cloud build services have free tiers and paid plans from ~$20/mo.
- **Security concerns:** Never ship API secrets inside the app bundle — they can be extracted. Third-party plugins bridge to native code — vet and update them.
- **Scalability:** High. Scales with users; one team can ship to both platforms.
- **Governance, risk & compliance:** App Store and Play policies (privacy labels, data-safety forms, account deletion) apply to both store listings. Over-the-air updates must stay within store rules (no new features bypassing review on iOS).
- **Auditing for correctness:** One shared test suite plus device testing on both platforms; crash reporting with source maps.
- **Staying on top of costs:** Watch build-service minutes and OTA update bandwidth.
- **Performance:** Near-native for most apps; heavy animation or graphics may need native modules.

## Does this app need a backend?

**Chosen:** Lightweight backend-as-a-service for sync/accounts (e.g. Supabase, Firebase)

A managed platform provides database, auth, and sync without you running a server.

**Tradeoffs:** Fast to get real accounts and data sync working, at the cost of building against that platform's specific APIs and pricing model.

**Alternatives not chosen:** No backend — fully local/offline app; Custom backend API you build and host yourself

### What this means in practice

- **Deployment complexity:** Low. Configure the service and its security rules; no servers to deploy.
- **Accounts & integrations to manage:** BaaS account (e.g. Supabase, Firebase). Usually covers database, auth, file storage, and functions in one account.
- **Ballpark cost:** Free. Generous free tiers; ~$25/mo paid plans once you outgrow them.
- **Security concerns:** Your security rules (Firebase Rules / Supabase row-level security) ARE your access control — a misconfigured rule exposes everyone's data.
- **Scalability:** High. Scales with the vendor; pricing climbs with reads, storage, and bandwidth.
- **Governance, risk & compliance:** User data lives with the vendor — choose the region, sign the DPA, and support account deletion (required by both app stores).
- **Auditing for correctness:** Write automated tests for your security rules; use the vendor's logs and usage dashboards.
- **Staying on top of costs:** Set budget alerts — a bug that reads in a loop can multiply usage-billed costs overnight.
- **Performance:** Good; real-time sync and offline caching are often built in.

## How do users sign in?

**Chosen:** Email/password or social login

Standard account creation, typically via a backend-as-a-service's built-in auth.

**Tradeoffs:** Familiar to most users and well-supported by mobile backend platforms, at the cost of some signup friction.

**Alternatives not chosen:** No accounts needed; Single sign-on with an existing company identity system

### What this means in practice

- **Deployment complexity:** Medium. Configure an auth provider plus deep links for email verification and OAuth redirects on both platforms.
- **Accounts & integrations to manage:** Auth provider (Firebase Auth, Supabase, Auth0, etc.); Apple Sign in setup; Google OAuth setup. Apple requires 'Sign in with Apple' if you offer other social logins on iOS.
- **Ballpark cost:** Free. Free up to thousands of monthly active users on most providers.
- **Security concerns:** Store tokens in Keychain/Keystore, not plain storage. Use the provider rather than building password handling.
- **Scalability:** High. Scales with the provider.
- **Governance, risk & compliance:** Both stores require in-app account deletion. Sign the provider's DPA; list the data in privacy labels.
- **Auditing for correctness:** Test login, logout, token refresh, and account deletion on both platforms; watch the provider's login logs.
- **Staying on top of costs:** Track monthly active users against the free tier threshold.
- **Performance:** Login is a one-time redirect; tokens keep later requests fast.

## Do you need push notifications?

**Chosen:** Standard push service (e.g. Firebase Cloud Messaging / Apple Push)

Basic push notifications sent through the standard platform services.

**Tradeoffs:** Free and well-supported by most cross-platform frameworks, though you'll build your own sending/targeting logic.

**Alternatives not chosen:** No push notifications needed; Rich in-app messaging/marketing platform (e.g. OneSignal, Braze)

### What this means in practice

- **Deployment complexity:** Medium. Configure APNs keys and FCM, store device tokens, and send from a server or function.
- **Accounts & integrations to manage:** Firebase project (FCM); Apple Push Notification key; A backend to send from. APNs keys must be uploaded to FCM or your sender.
- **Ballpark cost:** Free. FCM and APNs are free; only your sending backend costs anything.
- **Security concerns:** Protect the APNs key and FCM server credentials — whoever has them can message every user. Don't put sensitive data in notification text.
- **Scalability:** High. Handles millions of devices.
- **Governance, risk & compliance:** Users must opt in; marketing pushes may need consent under privacy and anti-spam laws.
- **Auditing for correctness:** Log sends and delivery results; clean up invalid tokens; test on real devices (simulators are unreliable for push).
- **Staying on top of costs:** Free to send; watch your own backend's usage.
- **Performance:** Delivery usually takes seconds but isn't guaranteed — never rely on push for critical data.

## Changes after the wizard

_Record any decision changed during spec/plan work here: what changed, why, and what it affects._
