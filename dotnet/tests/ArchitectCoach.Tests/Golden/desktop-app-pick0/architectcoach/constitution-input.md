# Constitution input — Desktop app

Give this to `/speckit.constitution`, together with the answers to the budget, compliance,
sensitive-data, user-location, accessibility, and performance questions in `open-questions.md`.
These are the principles every spec, plan, and task must respect.

## 1. The architecture decisions are binding

- Who is this app for? → **General public (consumer software)**
- What's the main goal for this app? → **Work with local files or hardware directly**
- How should this app be built? → **Native desktop toolkit (e.g. WinForms/WPF, Cocoa/AppKit, Qt/GTK)**
- Does it need local data storage? → **No persistent data needed**
- How will people install and update it? → **Manual download from a website**
- Does the app require user accounts? → **No accounts needed — works standalone**

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

- _Native desktop toolkit (e.g. WinForms/WPF, Cocoa/AppKit, Qt/GTK):_ Direct OS access — validate any files or input you load, and sign your binaries so users can verify they're yours.
- _No persistent data needed:_ Nothing stored to protect.
- _Manual download from a website:_ Users must trust your download page — serve over HTTPS, sign installers, and publish checksums.
- _No accounts needed — works standalone:_ No credentials to protect.

## 7. Governance, risk & compliance

- _Native desktop toolkit (e.g. WinForms/WPF, Cocoa/AppKit, Qt/GTK):_ Check the toolkit's license (Qt is LGPL/commercial). Most enterprises require signed installers.
- _No persistent data needed:_ No data retention concerns.
- _Manual download from a website:_ Old versions in the field may have known vulnerabilities you can't force-patch.
- _No accounts needed — works standalone:_ No personal data collected for accounts.

## 8. Cost guardrails

Set a budget alert on every paid account at the monthly limit from `open-questions.md`.

- _Native desktop toolkit (e.g. WinForms/WPF, Cocoa/AppKit, Qt/GTK):_ Fixed yearly signing fees — calendar the renewals; an expired certificate breaks new installs.
- _No persistent data needed:_ Nothing to monitor.
- _Manual download from a website:_ Watch bandwidth if installers are large and hosted on metered storage.
- _No accounts needed — works standalone:_ Nothing to monitor.

## 9. Auditing for correctness

- _Native desktop toolkit (e.g. WinForms/WPF, Cocoa/AppKit, Qt/GTK):_ Unit tests plus UI automation (e.g. WinAppDriver); crash reporting so you see failures in the field.
- _No persistent data needed:_ Nothing to audit.
- _Manual download from a website:_ Track which versions are in use (e.g. via crash reports) to know how many are outdated.
- _No accounts needed — works standalone:_ Nothing to audit.

## 10. Performance

- _Native desktop toolkit (e.g. WinForms/WPF, Cocoa/AppKit, Qt/GTK):_ Best: small memory footprint and fast startup.
- _No persistent data needed:_ No impact.
- _Manual download from a website:_ No runtime impact.
- _No accounts needed — works standalone:_ No login step.
