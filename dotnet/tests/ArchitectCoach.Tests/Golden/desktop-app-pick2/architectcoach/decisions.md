# Decisions already made — Desktop app

Made in ArchitectCoach's wizard. Treat these as settled (see AGENTS.md, rule 1).
Cost figures are rough monthly ballparks as of October 2026; check current vendor pricing.

**Purpose:** _Not stated — ask the developer._

## Who is this app for?

**Chosen:** Technical or power users (e.g. a developer tool)

An audience comfortable with command lines, config files, and less hand-holding.

**Tradeoffs:** You can lean on simpler installs (even a plain binary) since polish matters less than capability to this audience.

**Alternatives not chosen:** General public (consumer software); Your own organization's employees (internal tool); A specific client or small business

## What's the main goal for this app?

**Chosen:** Automate a repetitive workflow

The app exists to script or streamline a task a person currently does by hand.

**Tradeoffs:** Often simple enough to start as a command-line tool before a full GUI is justified.

**Alternatives not chosen:** Work with local files or hardware directly; Provide a fast, offline-capable version of a web product; Provide a GUI over an existing command-line tool or service

## How should this app be built?

**Chosen:** Cross-platform UI framework compiled natively (e.g. .NET MAUI, Flutter Desktop)

One codebase compiled to a genuinely native app on each platform, rather than running in an embedded browser.

**Tradeoffs:** Better performance and smaller installs than Electron-style tools, but less mature desktop tooling and a smaller community to lean on.

**Alternatives not chosen:** Native desktop toolkit (e.g. WinForms/WPF, Cocoa/AppKit, Qt/GTK); Cross-platform desktop framework (e.g. Electron, Tauri)

### What this means in practice

- **Deployment complexity:** Medium. One codebase with per-OS builds and installers; desktop support is younger than mobile support in both frameworks.
- **Accounts & integrations to manage:** Code-signing certificate (Windows); Apple Developer Program; CI with Mac and Windows runners. Signing is needed on every OS to avoid security warnings.
- **Ballpark cost:** ~$10/mo. Free frameworks; same signing fees.
- **Security concerns:** Compiled code with a smaller dependency surface than Electron; still sign binaries and validate input.
- **Scalability:** High. Shares code with mobile apps if you have them.
- **Governance, risk & compliance:** Check that the framework's desktop support is considered stable for your target OS versions.
- **Auditing for correctness:** Unit tests plus testing on each OS — platform-specific bugs are more common in younger desktop targets.
- **Staying on top of costs:** Signing renewals and CI minutes.
- **Performance:** Good — native compilation, lighter than Electron.

## Does it need local data storage?

**Chosen:** Syncs with a cloud backend/database

Local data is a cache/mirror of data that also lives on a server.

**Tradeoffs:** Enables multi-device access and backup, but now you're also building (or depending on) a backend and a sync strategy.

**Alternatives not chosen:** No persistent data needed; Embedded local database (e.g. SQLite)

### What this means in practice

- **Deployment complexity:** High. A backend to deploy and version, plus sync and conflict resolution in the app — the hardest part to get right.
- **Accounts & integrations to manage:** Backend hosting or BaaS; Cloud database; Auth provider. Effectively a web backend alongside the desktop app.
- **Ballpark cost:** ~$10/mo. ~$0–25/mo on BaaS free tiers; rises with users and storage.
- **Security concerns:** Encrypt in transit, authenticate every sync call, and protect local cached copies too.
- **Scalability:** High. Scales with the backend you choose.
- **Governance, risk & compliance:** You now hold user data in the cloud: privacy policy, region choice, deletion requests, and the vendor's DPA.
- **Auditing for correctness:** Test conflict scenarios (offline edits on two devices); log sync failures centrally.
- **Staying on top of costs:** Billing alerts on backend and storage; watch for sync loops that re-upload data.
- **Performance:** Local-first sync feels instant; naive 'always fetch from server' designs feel slow.

## How will people install and update it?

**Chosen:** Auto-update built into the app (e.g. Squirrel, Sparkle)

The app checks for and installs updates itself, outside any app store.

**Tradeoffs:** Keeps users current without relying on a store, but you're responsible for hosting releases and keeping the update mechanism itself secure.

**Alternatives not chosen:** Manual download from a website; Platform app store (Microsoft Store / Mac App Store)

### What this means in practice

- **Deployment complexity:** Medium. Publish signed updates to an update feed; the app checks and installs them. Needs a careful release process.
- **Accounts & integrations to manage:** Update feed hosting (e.g. GitHub Releases, S3); Code-signing certificates. Signing keys for updates must be guarded closely.
- **Ballpark cost:** ~$10/mo. Signing plus small hosting costs; bandwidth grows with users × update size.
- **Security concerns:** A compromised update channel can push malware to every user — sign updates, verify signatures, and serve only over HTTPS.
- **Scalability:** High. Most users stay on the latest version automatically.
- **Governance, risk & compliance:** Tell users the app updates automatically; enterprises may want to control the timing.
- **Auditing for correctness:** Stage rollouts and watch crash rates before releasing to everyone; keep the ability to pull a bad release.
- **Staying on top of costs:** Monitor bandwidth on the update feed — every release is downloaded by every user.
- **Performance:** Downloads in the background; small runtime cost.

## Does the app require user accounts?

**Chosen:** Required company or SSO login

The app can't be used at all without signing in via an organization's identity system.

**Tradeoffs:** Fits an internal-tool audience well, but makes the app unusable outside that organization's identity setup.

**Alternatives not chosen:** No accounts needed — works standalone; Optional account for syncing or cloud features

### What this means in practice

- **Deployment complexity:** Medium. Register the app with the company's identity provider (Entra ID, Okta) and handle token refresh and offline behavior.
- **Accounts & integrations to manage:** Company identity provider app registration. Coordination with the customer's IT team.
- **Ballpark cost:** Free. Usually covered by existing identity licenses.
- **Security concerns:** Strong: MFA and conditional access come from the identity provider. Use the system browser with PKCE, not embedded login forms.
- **Scalability:** High. Scales with the identity provider.
- **Governance, risk & compliance:** Fits corporate compliance well — central deprovisioning and sign-in logs.
- **Auditing for correctness:** Sign-in logs live in the identity provider; test what happens when a token expires while offline.
- **Staying on top of costs:** Little direct cost.
- **Performance:** Login may involve MFA; normal use unaffected.

## Changes after the wizard

_Record any decision changed during spec/plan work here: what changed, why, and what it affects._
