# Constitution input — Desktop app

Give this to `/speckit.constitution`, together with the answers to the budget, compliance,
sensitive-data, user-location, accessibility, and performance questions in `open-questions.md`.
These are the principles every spec, plan, and task must respect.

## 1. The architecture decisions are binding

- Who is this app for? → **Technical or power users (e.g. a developer tool)**
- What's the main goal for this app? → **Automate a repetitive workflow**
- How should this app be built? → **Cross-platform UI framework compiled natively (e.g. .NET MAUI, Flutter Desktop)**
- Does it need local data storage? → **Syncs with a cloud backend/database**
- How will people install and update it? → **Auto-update built into the app (e.g. Squirrel, Sparkle)**
- Does the app require user accounts? → **Required company or SSO login**

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

- _Cross-platform UI framework compiled natively (e.g. .NET MAUI, Flutter Desktop):_ Compiled code with a smaller dependency surface than Electron; still sign binaries and validate input.
- _Syncs with a cloud backend/database:_ Encrypt in transit, authenticate every sync call, and protect local cached copies too.
- _Auto-update built into the app (e.g. Squirrel, Sparkle):_ A compromised update channel can push malware to every user — sign updates, verify signatures, and serve only over HTTPS.
- _Required company or SSO login:_ Strong: MFA and conditional access come from the identity provider. Use the system browser with PKCE, not embedded login forms.

## 7. Governance, risk & compliance

- _Cross-platform UI framework compiled natively (e.g. .NET MAUI, Flutter Desktop):_ Check that the framework's desktop support is considered stable for your target OS versions.
- _Syncs with a cloud backend/database:_ You now hold user data in the cloud: privacy policy, region choice, deletion requests, and the vendor's DPA.
- _Auto-update built into the app (e.g. Squirrel, Sparkle):_ Tell users the app updates automatically; enterprises may want to control the timing.
- _Required company or SSO login:_ Fits corporate compliance well — central deprovisioning and sign-in logs.

## 8. Cost guardrails

Set a budget alert on every paid account at the monthly limit from `open-questions.md`.

- _Cross-platform UI framework compiled natively (e.g. .NET MAUI, Flutter Desktop):_ Signing renewals and CI minutes.
- _Syncs with a cloud backend/database:_ Billing alerts on backend and storage; watch for sync loops that re-upload data.
- _Auto-update built into the app (e.g. Squirrel, Sparkle):_ Monitor bandwidth on the update feed — every release is downloaded by every user.
- _Required company or SSO login:_ Little direct cost.

## 9. Auditing for correctness

- _Cross-platform UI framework compiled natively (e.g. .NET MAUI, Flutter Desktop):_ Unit tests plus testing on each OS — platform-specific bugs are more common in younger desktop targets.
- _Syncs with a cloud backend/database:_ Test conflict scenarios (offline edits on two devices); log sync failures centrally.
- _Auto-update built into the app (e.g. Squirrel, Sparkle):_ Stage rollouts and watch crash rates before releasing to everyone; keep the ability to pull a bad release.
- _Required company or SSO login:_ Sign-in logs live in the identity provider; test what happens when a token expires while offline.

## 10. Performance

- _Cross-platform UI framework compiled natively (e.g. .NET MAUI, Flutter Desktop):_ Good — native compilation, lighter than Electron.
- _Syncs with a cloud backend/database:_ Local-first sync feels instant; naive 'always fetch from server' designs feel slow.
- _Auto-update built into the app (e.g. Squirrel, Sparkle):_ Downloads in the background; small runtime cost.
- _Required company or SSO login:_ Login may involve MFA; normal use unaffected.
