# Decisions already made — Desktop app

Made in ArchitectCoach's wizard. Treat these as settled (see AGENTS.md, rule 1).
Cost figures are rough monthly ballparks as of October 2026; check current vendor pricing.

**Purpose:** Team's "booking" site & admin <beta>

## Who is this app for?

**Chosen:** Your own organization's employees (internal tool)

Used only inside your company, on company-managed machines.

**Tradeoffs:** You control the OS/hardware it needs to run on, which removes a lot of compatibility uncertainty.

**Alternatives not chosen:** General public (consumer software); Technical or power users (e.g. a developer tool); A specific client or small business

## What's the main goal for this app?

**Chosen:** Provide a fast, offline-capable version of a web product

A desktop-installed alternative to an existing (or planned) web app.

**Tradeoffs:** Worth double-checking a web app wouldn't already serve this need before taking on a separate desktop build.

**Alternatives not chosen:** Work with local files or hardware directly; Automate a repetitive workflow; Provide a GUI over an existing command-line tool or service

## How should this app be built?

**Chosen:** Cross-platform desktop framework (e.g. Electron, Tauri)

Build the UI with web technology, packaged as a desktop app for Windows/Mac/Linux.

**Tradeoffs:** Fastest path if you already know web development, and one codebase covers every OS — the tradeoff is larger install size and higher memory use (Electron especially; Tauri is lighter).

**Alternatives not chosen:** Native desktop toolkit (e.g. WinForms/WPF, Cocoa/AppKit, Qt/GTK); Cross-platform UI framework compiled natively (e.g. .NET MAUI, Flutter Desktop)

### What this means in practice

- **Deployment complexity:** Medium. One codebase, but signing and notarizing for Windows and Mac plus per-OS installers. Tools like electron-builder automate it.
- **Accounts & integrations to manage:** Code-signing certificate (Windows); Apple Developer Program; CI with Mac and Windows runners. Release hosting for installers (e.g. GitHub Releases).
- **Ballpark cost:** ~$10/mo. Windows signing ~$10/mo (Azure Trusted Signing) and Apple's $99/yr; Mac CI minutes cost more than Linux.
- **Security concerns:** Electron needs care: turn off Node integration in renderers, use context isolation, keep Electron updated (it bundles Chromium). Tauri is safer by default.
- **Scalability:** High. One team ships to all desktop operating systems.
- **Governance, risk & compliance:** Electron bundles Chromium — you're responsible for shipping its security patches promptly.
- **Auditing for correctness:** Playwright can test Electron apps end to end; add crash reporting and check signed builds on clean machines.
- **Staying on top of costs:** Signing renewals and CI minutes.
- **Performance:** Electron uses 100+ MB of memory and installers of ~100 MB; Tauri is much lighter (~10 MB) because it uses the OS's web view.

## Does it need local data storage?

**Chosen:** Embedded local database (e.g. SQLite)

A real database file that lives alongside the app, with no separate server.

**Tradeoffs:** Reliable structured storage with no server to run, at the cost of a bit more setup than a plain settings file.

**Alternatives not chosen:** No persistent data needed; Syncs with a cloud backend/database

### What this means in practice

- **Deployment complexity:** Low. The database ships inside the app; you need a schema-upgrade step that runs when the app updates.
- **Accounts & integrations to manage:** None. No service to manage.
- **Ballpark cost:** Free. No cost.
- **Security concerns:** Data sits on the user's disk — encrypt sensitive data (e.g. SQLCipher) and store it in the user's profile folder.
- **Scalability:** Medium. Great for one user's data; no sharing between devices or users.
- **Governance, risk & compliance:** Data never leaves the user's machine — a strong privacy position. Users are responsible for their own backups unless you add export.
- **Auditing for correctness:** Test schema upgrades from every older version you've shipped; add an integrity check on startup.
- **Staying on top of costs:** Nothing to monitor.
- **Performance:** Very fast — local disk, no network.

## How will people install and update it?

**Chosen:** Platform app store (Microsoft Store / Mac App Store)

Distributed and updated through the OS's official store.

**Tradeoffs:** Built-in discovery and update mechanism, at the cost of store review requirements and a revenue cut on paid apps.

**Alternatives not chosen:** Manual download from a website; Auto-update built into the app (e.g. Squirrel, Sparkle)

### What this means in practice

- **Deployment complexity:** Medium. Store packaging (MSIX / Mac App Store), review processes, and sandboxing rules.
- **Accounts & integrations to manage:** Microsoft Partner Center; Apple Developer Program. Each store has its own listing, review, and policy requirements.
- **Ballpark cost:** ~$10/mo. Microsoft Store registration is free for individuals; Apple is $99/yr. Stores take a cut of paid apps.
- **Security concerns:** The store signs and scans apps; Mac App Store sandboxing limits what the app can access.
- **Scalability:** High. Store handles distribution and updates for any number of users.
- **Governance, risk & compliance:** Store policies govern privacy disclosures and in-app payments; sandbox limits may block some features.
- **Auditing for correctness:** Store dashboards show installs, crashes, and ratings.
- **Staying on top of costs:** Fixed fees; revenue share on paid apps.
- **Performance:** No runtime impact; sandboxing can slightly restrict file access.

## Does the app require user accounts?

**Chosen:** Optional account for syncing or cloud features

The app works standalone, but signing in unlocks sync/backup/cloud features.

**Tradeoffs:** Good of both worlds for users, but means building and maintaining two real modes of operation (signed-in and signed-out).

**Alternatives not chosen:** No accounts needed — works standalone; Required company or SSO login

### What this means in practice

- **Deployment complexity:** Medium. An auth provider plus a login flow through the system browser that returns to the app.
- **Accounts & integrations to manage:** Auth provider (e.g. Auth0, Supabase Auth). Plus whatever cloud backend the account unlocks.
- **Ballpark cost:** Free. Free tiers cover thousands of monthly active users.
- **Security concerns:** Store tokens in the OS credential store (Windows Credential Manager, macOS Keychain), not in config files.
- **Scalability:** High. Scales with the provider.
- **Governance, risk & compliance:** Account holders' data falls under privacy law; offer account deletion; sign the provider's DPA.
- **Auditing for correctness:** Test the app both signed in and signed out — the offline path is easy to break.
- **Staying on top of costs:** Track monthly active users against the free tier.
- **Performance:** Login only when needed; the app keeps working offline.

## Changes after the wizard

_Record any decision changed during spec/plan work here: what changed, why, and what it affects._
