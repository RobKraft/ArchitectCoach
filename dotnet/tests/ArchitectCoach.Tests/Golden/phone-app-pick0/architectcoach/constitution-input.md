# Constitution input — Phone app

Give this to `/speckit.constitution`, together with the answers to the budget, compliance,
sensitive-data, user-location, accessibility, and performance questions in `open-questions.md`.
These are the principles every spec, plan, and task must respect.

## 1. The architecture decisions are binding

- Who is this app for? → **General consumers (public app store)**
- What's the main goal for this app? → **Provide on-the-go access to a service or content**
- How should this app be built? → **Native (separate Swift/iOS and Kotlin/Android codebases)**
- Does this app need a backend? → **No backend — fully local/offline app**
- How do users sign in? → **No accounts needed**
- Do you need push notifications? → **No push notifications needed**

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

- _Native (separate Swift/iOS and Kotlin/Android codebases):_ Full access to platform security features (Keychain, Keystore, biometrics). Never ship API secrets inside the app — they can be extracted.
- _No backend — fully local/offline app:_ Data stays on the device — use the platform's secure storage for anything sensitive.
- _No accounts needed:_ No credentials to protect. Data can't follow a user to a new phone without accounts.
- _No push notifications needed:_ Nothing to secure.

## 7. Governance, risk & compliance

- _Native (separate Swift/iOS and Kotlin/Android codebases):_ App Store and Play policies (privacy labels, data-safety forms, account-deletion requirements) apply to both apps separately.
- _No backend — fully local/offline app:_ Simplest privacy story: you collect nothing. Store privacy labels can truthfully say 'no data collected'.
- _No accounts needed:_ Simplest compliance position — no account-deletion flow required by the stores.
- _No push notifications needed:_ No notification-permission prompts or marketing-consent questions.

## 8. Cost guardrails

Set a budget alert on every paid account at the monthly limit from `open-questions.md`.

- _Native (separate Swift/iOS and Kotlin/Android codebases):_ Fixed developer fees; watch CI macOS build minutes, which cost more than Linux.
- _No backend — fully local/offline app:_ Nothing to monitor.
- _No accounts needed:_ Nothing to monitor.
- _No push notifications needed:_ Nothing to monitor.

## 9. Auditing for correctness

- _Native (separate Swift/iOS and Kotlin/Android codebases):_ Unit and UI tests per platform, crash reporting, and staged rollouts in both stores.
- _No backend — fully local/offline app:_ Test data migrations between app versions, since you can't fix stored data from a server.
- _No accounts needed:_ Nothing to audit.
- _No push notifications needed:_ Nothing to audit.

## 10. Performance

- _Native (separate Swift/iOS and Kotlin/Android codebases):_ Best possible — native UI and direct platform APIs.
- _No backend — fully local/offline app:_ Instant — no network calls; works offline.
- _No accounts needed:_ No login step at all.
- _No push notifications needed:_ No impact.
