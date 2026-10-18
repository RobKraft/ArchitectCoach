# Privacy and accessibility: Phone app

These are requirements, not polish. The constitution makes **privacy by design** and
**accessible by default (WCAG 2.2 AA)** binding principles, and every plan and task must account
for them (see AGENTS.md).

> General guidance as of October 2026, not legal advice. Laws, thresholds, and
> dates change. Get a short legal review of the privacy notice before a public launch.

## Part 1: Personal data (PII)

"Personal data" (GDPR) and "personal information" (CCPA) are broader than most people expect:
**an email address on its own counts**, and so do IP addresses, device IDs, and free text users
type that mentions themselves. Assume anything tied to a person or account is in scope.

### PII inventory (fill in during planning)

| Data item | Why it's collected | Lawful basis (GDPR) | Retention | Who can access | Processors that receive it | How it's deleted |
|---|---|---|---|---|---|---|
| _e.g. Email address_ | _Sign-in, password reset_ | _Contract_ | _Until account deletion_ | _App only; admins on request_ | _Host, email provider_ | _Account deletion cascade_ |
| | | | | | | |

### GDPR checklist (EU/UK users)

- [ ] **Applies if** you offer the product to people in the EU/UK or monitor their behavior, wherever you are based.
- [ ] **Minimize:** every personal-data field has a stated purpose. If you can't name one, don't collect it.
- [ ] **Lawful basis** recorded for each purpose: contract (needed to provide the service), consent, legitimate interest, or legal obligation.
- [ ] **Privacy notice** written in plain language: who you are and how to contact you, what you collect, why, the lawful basis, how long you keep it, who receives it (processors), international transfers, and users' rights.
- [ ] **Data-subject rights** you can actually fulfill within one month: access, export (portability), correction, erasure, restriction, and objection. Self-service export/delete is easiest.
- [ ] **Retention** period for each data type, plus a mechanism that actually deletes data when the period ends.
- [ ] **Processors:** a data processing agreement (DPA) with every vendor that receives personal data (host, database, email, analytics, error tracking).
- [ ] **International transfers** (e.g. EU users' data hosted in the US): covered by the EU–US Data Privacy Framework or standard contractual clauses. Say so in the notice.
- [ ] **Cookies:** strictly necessary cookies (sign-in, CSRF) need no consent. Analytics, advertising, and tracking cookies need opt-in consent *before* they're set.
- [ ] **Security** appropriate to the data: encryption in transit (HTTPS) and at rest, access control, hashed passwords, patched dependencies.
- [ ] **Breach plan:** notify the supervisory authority within 72 hours if there's a risk to people, and the affected people without undue delay if the risk is high. Keep a record of every breach.
- [ ] **Children:** if users can be under 16 (13–16, depending on the country), consent-based processing needs parental consent. Simplest is to state a minimum age and not target children.

### CCPA checklist (California users)

- [ ] **Applies to** for-profit businesses that do business in California and meet a threshold: annual revenue above ~$26.6M (inflation-adjusted), buying/selling/sharing personal information of 100,000+ consumers or households, or earning 50%+ of revenue from selling/sharing it. Below the thresholds, following it anyway is cheap goodwill. Other US states (e.g. Virginia, Colorado, Connecticut, Texas) have similar laws.
- [ ] **Email addresses count** as personal information. An email + password combination is covered by California's breach-notification law even when the password is hashed.
- [ ] **Notice at collection:** at or before the point you collect data, say what you collect and why, with a link to the privacy policy.
- [ ] **Rights:** know/access, delete, correct, opt out of sale or sharing, limit use of sensitive personal information, and non-discrimination for exercising any of them. Respond within 45 days.
- [ ] **"Do Not Sell or Share My Personal Information" link** if you sell data or share it for cross-context behavioral advertising (e.g. ad pixels). Honor the Global Privacy Control browser signal.
- [ ] **Verify requests** before releasing or deleting data, using information you already hold (e.g. a signed-in session).
- [ ] **Service providers:** written contracts limiting what vendors may do with the data.

### Specific to a phone app

- [ ] **App Store privacy labels** and **Google Play Data safety** forms must match what the app and every SDK in it actually collect.
- [ ] Both stores require **in-app account deletion** if users can create accounts.
- [ ] Request device permissions (location, camera, contacts) only when the feature is used, with a clear reason. iOS requires App Tracking Transparency consent for cross-app tracking.
- [ ] Third-party SDKs (analytics, ads, crash reporting) collect data in your name. Inventory them and disclose them.
- [ ] Store tokens and sensitive data in Keychain/Keystore, not plain storage.

## Part 2: Accessibility (WCAG 2.2 AA, ADA)

### Checklist for phone apps

- [ ] **Screen readers:** every control has an accessibility label, role, and state for VoiceOver (iOS) and TalkBack (Android). Test both.
- [ ] **Dynamic Type / font scaling:** layouts work at the largest system text sizes without truncating essential content.
- [ ] **Touch targets:** at least 44×44 pt (iOS) / 48×48 dp (Android).
- [ ] **Contrast and color:** same WCAG ratios as the web (4.5:1 text, 3:1 UI). Support dark mode and the system high-contrast/increase-contrast settings.
- [ ] **Focus order** follows the visual order. Custom gestures have a single-tap or button alternative.
- [ ] **Motion:** respect Reduce Motion (iOS) / Remove animations (Android).
- [ ] **Forms:** labels and errors announced by the screen reader, with keyboard type matched to the field (email, number).
- [ ] **Media:** captions for video, transcripts for audio.
- [ ] **Hardware keyboards and switch access** work for core flows (common on tablets and for motor-impaired users).

### How to test

- [ ] Automated: Xcode Accessibility Inspector audits and Android Accessibility Scanner / Espresso accessibility checks in CI.
- [ ] Manual, per release: VoiceOver and TalkBack on core flows, largest font size, and dark mode plus increased contrast.
- [ ] Accessibility notes in the store listing and an in-app way to report problems.

### Legal context

- **ADA Title III (US, private businesses):** courts and the DOJ commonly treat business websites and apps as places of public accommodation. Lawsuits usually cite **WCAG 2.1/2.2 AA** as the yardstick.
- **ADA Title II (US, state and local government):** the DOJ's 2024 rule requires **WCAG 2.1 AA** for web content and mobile apps, with compliance dates in April 2026 (populations of 50,000+) and April 2027 (smaller entities). Check for later DOJ changes before relying on these dates.
- **Section 508 (US federal agencies and their contractors):** requires WCAG 2.0 AA-level conformance.
- **European Accessibility Act:** since June 2025, many consumer digital services in the EU (e-commerce, banking, e-books, transport ticketing, and more) must be accessible, in practice EN 301 549 / WCAG 2.1 AA. Microenterprises providing services are exempt.
- **Target WCAG 2.2 AA:** it includes 2.1 AA and satisfies all of the above in practice.
