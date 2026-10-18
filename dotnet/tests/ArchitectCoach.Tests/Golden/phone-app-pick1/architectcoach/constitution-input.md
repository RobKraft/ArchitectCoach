# Constitution input — Phone app

Give this to `/speckit.constitution`, together with the answers to the budget, compliance,
sensitive-data, user-location, accessibility, and performance questions in `open-questions.md`.
These are the principles every spec, plan, and task must respect.

## 1. The architecture decisions are binding

- Who is this app for? → **Your own customers (branded companion app)**
- What's the main goal for this app? → **Enable a specific task (e.g. tracking, ordering, booking)**
- How should this app be built? → **Cross-platform framework (e.g. React Native, Flutter)**
- Does this app need a backend? → **Lightweight backend-as-a-service for sync/accounts (e.g. Supabase, Firebase)**
- How do users sign in? → **Email/password or social login**
- Do you need push notifications? → **Standard push service (e.g. Firebase Cloud Messaging / Apple Push)**

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

- _Cross-platform framework (e.g. React Native, Flutter):_ Never ship API secrets inside the app bundle — they can be extracted. Third-party plugins bridge to native code — vet and update them.
- _Lightweight backend-as-a-service for sync/accounts (e.g. Supabase, Firebase):_ Your security rules (Firebase Rules / Supabase row-level security) ARE your access control — a misconfigured rule exposes everyone's data.
- _Email/password or social login:_ Store tokens in Keychain/Keystore, not plain storage. Use the provider rather than building password handling.
- _Standard push service (e.g. Firebase Cloud Messaging / Apple Push):_ Protect the APNs key and FCM server credentials — whoever has them can message every user. Don't put sensitive data in notification text.

## 7. Governance, risk & compliance

- _Cross-platform framework (e.g. React Native, Flutter):_ App Store and Play policies (privacy labels, data-safety forms, account deletion) apply to both store listings. Over-the-air updates must stay within store rules (no new features bypassing review on iOS).
- _Lightweight backend-as-a-service for sync/accounts (e.g. Supabase, Firebase):_ User data lives with the vendor — choose the region, sign the DPA, and support account deletion (required by both app stores).
- _Email/password or social login:_ Both stores require in-app account deletion. Sign the provider's DPA; list the data in privacy labels.
- _Standard push service (e.g. Firebase Cloud Messaging / Apple Push):_ Users must opt in; marketing pushes may need consent under privacy and anti-spam laws.

## 8. Cost guardrails

Set a budget alert on every paid account at the monthly limit from `open-questions.md`.

- _Cross-platform framework (e.g. React Native, Flutter):_ Watch build-service minutes and OTA update bandwidth.
- _Lightweight backend-as-a-service for sync/accounts (e.g. Supabase, Firebase):_ Set budget alerts — a bug that reads in a loop can multiply usage-billed costs overnight.
- _Email/password or social login:_ Track monthly active users against the free tier threshold.
- _Standard push service (e.g. Firebase Cloud Messaging / Apple Push):_ Free to send; watch your own backend's usage.

## 9. Auditing for correctness

- _Cross-platform framework (e.g. React Native, Flutter):_ One shared test suite plus device testing on both platforms; crash reporting with source maps.
- _Lightweight backend-as-a-service for sync/accounts (e.g. Supabase, Firebase):_ Write automated tests for your security rules; use the vendor's logs and usage dashboards.
- _Email/password or social login:_ Test login, logout, token refresh, and account deletion on both platforms; watch the provider's login logs.
- _Standard push service (e.g. Firebase Cloud Messaging / Apple Push):_ Log sends and delivery results; clean up invalid tokens; test on real devices (simulators are unreliable for push).

## 10. Performance

- _Cross-platform framework (e.g. React Native, Flutter):_ Near-native for most apps; heavy animation or graphics may need native modules.
- _Lightweight backend-as-a-service for sync/accounts (e.g. Supabase, Firebase):_ Good; real-time sync and offline caching are often built in.
- _Email/password or social login:_ Login is a one-time redirect; tokens keep later requests fast.
- _Standard push service (e.g. Firebase Cloud Messaging / Apple Push):_ Delivery usually takes seconds but isn't guaranteed — never rely on push for critical data.
