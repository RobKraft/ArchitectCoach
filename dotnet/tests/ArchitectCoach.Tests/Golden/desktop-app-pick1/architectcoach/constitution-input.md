# Constitution input — Desktop app

Give this to `/speckit.constitution`, together with the answers to the budget, compliance,
sensitive-data, user-location, accessibility, and performance questions in `open-questions.md`.
These are the principles every spec, plan, and task must respect.

## 1. The architecture decisions are binding

- Who is this app for? → **Your own organization's employees (internal tool)**
- What's the main goal for this app? → **Provide a fast, offline-capable version of a web product**
- How should this app be built? → **Cross-platform desktop framework (e.g. Electron, Tauri)**
- Does it need local data storage? → **Embedded local database (e.g. SQLite)**
- How will people install and update it? → **Platform app store (Microsoft Store / Mac App Store)**
- Does the app require user accounts? → **Optional account for syncing or cloud features**

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

- _Cross-platform desktop framework (e.g. Electron, Tauri):_ Electron needs care: turn off Node integration in renderers, use context isolation, keep Electron updated (it bundles Chromium). Tauri is safer by default.
- _Embedded local database (e.g. SQLite):_ Data sits on the user's disk — encrypt sensitive data (e.g. SQLCipher) and store it in the user's profile folder.
- _Platform app store (Microsoft Store / Mac App Store):_ The store signs and scans apps; Mac App Store sandboxing limits what the app can access.
- _Optional account for syncing or cloud features:_ Store tokens in the OS credential store (Windows Credential Manager, macOS Keychain), not in config files.

## 7. Governance, risk & compliance

- _Cross-platform desktop framework (e.g. Electron, Tauri):_ Electron bundles Chromium — you're responsible for shipping its security patches promptly.
- _Embedded local database (e.g. SQLite):_ Data never leaves the user's machine — a strong privacy position. Users are responsible for their own backups unless you add export.
- _Platform app store (Microsoft Store / Mac App Store):_ Store policies govern privacy disclosures and in-app payments; sandbox limits may block some features.
- _Optional account for syncing or cloud features:_ Account holders' data falls under privacy law; offer account deletion; sign the provider's DPA.

## 8. Cost guardrails

Set a budget alert on every paid account at the monthly limit from `open-questions.md`.

- _Cross-platform desktop framework (e.g. Electron, Tauri):_ Signing renewals and CI minutes.
- _Embedded local database (e.g. SQLite):_ Nothing to monitor.
- _Platform app store (Microsoft Store / Mac App Store):_ Fixed fees; revenue share on paid apps.
- _Optional account for syncing or cloud features:_ Track monthly active users against the free tier.

## 9. Auditing for correctness

- _Cross-platform desktop framework (e.g. Electron, Tauri):_ Playwright can test Electron apps end to end; add crash reporting and check signed builds on clean machines.
- _Embedded local database (e.g. SQLite):_ Test schema upgrades from every older version you've shipped; add an integrity check on startup.
- _Platform app store (Microsoft Store / Mac App Store):_ Store dashboards show installs, crashes, and ratings.
- _Optional account for syncing or cloud features:_ Test the app both signed in and signed out — the offline path is easy to break.

## 10. Performance

- _Cross-platform desktop framework (e.g. Electron, Tauri):_ Electron uses 100+ MB of memory and installers of ~100 MB; Tauri is much lighter (~10 MB) because it uses the OS's web view.
- _Embedded local database (e.g. SQLite):_ Very fast — local disk, no network.
- _Platform app store (Microsoft Store / Mac App Store):_ No runtime impact; sandboxing can slightly restrict file access.
- _Optional account for syncing or cloud features:_ Login only when needed; the app keeps working offline.
