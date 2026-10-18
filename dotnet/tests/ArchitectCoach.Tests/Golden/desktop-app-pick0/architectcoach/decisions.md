# Decisions already made — Desktop app

Made in ArchitectCoach's wizard. Treat these as settled (see AGENTS.md, rule 1).
Cost figures are rough monthly ballparks as of October 2026; check current vendor pricing.

**Purpose:** Project 4 purpose

## Who is this app for?

**Chosen:** General public (consumer software)

Anyone can download and install it.

**Tradeoffs:** Needs a polished installer and to support whatever OS versions your audience actually runs, which is more testing surface.

**Alternatives not chosen:** Your own organization's employees (internal tool); Technical or power users (e.g. a developer tool); A specific client or small business

## What's the main goal for this app?

**Chosen:** Work with local files or hardware directly

The app needs real access to the file system, peripherals, or other local resources.

**Tradeoffs:** This is the strongest reason to build a desktop app instead of a web app — browsers can't do most of this.

**Alternatives not chosen:** Provide a fast, offline-capable version of a web product; Automate a repetitive workflow; Provide a GUI over an existing command-line tool or service

## How should this app be built?

**Chosen:** Native desktop toolkit (e.g. WinForms/WPF, Cocoa/AppKit, Qt/GTK)

Built directly against one platform's native UI toolkit (or a native cross-platform one like Qt).

**Tradeoffs:** Best performance and the most native look/feel, but typically means separate builds (and separate UI code) per OS unless using a toolkit like Qt.

**Alternatives not chosen:** Cross-platform desktop framework (e.g. Electron, Tauri); Cross-platform UI framework compiled natively (e.g. .NET MAUI, Flutter Desktop)

### What this means in practice

- **Deployment complexity:** Medium. Build an installer per operating system; supporting more than one OS means separate builds (and separate code for WPF/Cocoa).
- **Accounts & integrations to manage:** Code-signing certificate (Windows); Apple Developer Program (Mac signing and notarization). Unsigned apps trigger scary OS warnings.
- **Ballpark cost:** ~$10/mo. Windows signing ~$10/mo via Azure Trusted Signing (or a ~$200–400/yr certificate); Apple is $99/yr. Qt commercial licenses cost much more.
- **Security concerns:** Direct OS access — validate any files or input you load, and sign your binaries so users can verify they're yours.
- **Scalability:** High. Runs on each user's machine. Supporting more operating systems is the real cost.
- **Governance, risk & compliance:** Check the toolkit's license (Qt is LGPL/commercial). Most enterprises require signed installers.
- **Auditing for correctness:** Unit tests plus UI automation (e.g. WinAppDriver); crash reporting so you see failures in the field.
- **Staying on top of costs:** Fixed yearly signing fees — calendar the renewals; an expired certificate breaks new installs.
- **Performance:** Best: small memory footprint and fast startup.

## Does it need local data storage?

**Chosen:** No persistent data needed

The app doesn't need to remember anything between runs.

**Tradeoffs:** Nothing to design or maintain, but confirm this is really true — most apps end up wanting at least user preferences saved.

**Alternatives not chosen:** Embedded local database (e.g. SQLite); Syncs with a cloud backend/database

### What this means in practice

- **Deployment complexity:** Low. Nothing extra to deploy.
- **Accounts & integrations to manage:** None. No extra accounts.
- **Ballpark cost:** Free. No cost.
- **Security concerns:** Nothing stored to protect.
- **Scalability:** High. Not applicable.
- **Governance, risk & compliance:** No data retention concerns.
- **Auditing for correctness:** Nothing to audit.
- **Staying on top of costs:** Nothing to monitor.
- **Performance:** No impact.

## How will people install and update it?

**Chosen:** Manual download from a website

Users download an installer directly; updates mean downloading and reinstalling again.

**Tradeoffs:** Simplest to set up, but users on old versions are common since nothing prompts them to update.

**Alternatives not chosen:** Platform app store (Microsoft Store / Mac App Store); Auto-update built into the app (e.g. Squirrel, Sparkle)

### What this means in practice

- **Deployment complexity:** Low. Build installers and upload them to a website or GitHub Releases.
- **Accounts & integrations to manage:** Download hosting (website or GitHub Releases); Code-signing certificates. Signing is still needed to avoid OS warnings.
- **Ballpark cost:** ~$10/mo. Hosting is cheap or free; signing is the main cost.
- **Security concerns:** Users must trust your download page — serve over HTTPS, sign installers, and publish checksums.
- **Scalability:** Medium. Downloads scale fine; getting users to update does not — many stay on old versions.
- **Governance, risk & compliance:** Old versions in the field may have known vulnerabilities you can't force-patch.
- **Auditing for correctness:** Track which versions are in use (e.g. via crash reports) to know how many are outdated.
- **Staying on top of costs:** Watch bandwidth if installers are large and hosted on metered storage.
- **Performance:** No runtime impact.

## Does the app require user accounts?

**Chosen:** No accounts needed — works standalone

The app is fully usable without signing in to anything.

**Tradeoffs:** Simplest option and works fully offline, but rules out any per-user sync or licensing tied to an account.

**Alternatives not chosen:** Optional account for syncing or cloud features; Required company or SSO login

### What this means in practice

- **Deployment complexity:** Low. Nothing to deploy.
- **Accounts & integrations to manage:** None. No extra accounts.
- **Ballpark cost:** Free. No cost.
- **Security concerns:** No credentials to protect.
- **Scalability:** High. Not applicable.
- **Governance, risk & compliance:** No personal data collected for accounts.
- **Auditing for correctness:** Nothing to audit.
- **Staying on top of costs:** Nothing to monitor.
- **Performance:** No login step.

## Changes after the wizard

_Record any decision changed during spec/plan work here: what changed, why, and what it affects._
