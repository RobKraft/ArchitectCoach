# Privacy and accessibility: Static site with a blog

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

### Specific to a static site with a blog

- [ ] Newsletter signups need double opt-in, an unsubscribe link in every email (CAN-SPAM/GDPR), and a record of consent.
- [ ] Comments store names, emails, and IP addresses. Say so in the notice, set a retention period, and let commenters delete their comments.
- [ ] Embedded content and comment widgets may track readers. Prefer privacy-friendly options or click-to-load.

## Part 2: Accessibility (WCAG 2.2 AA, ADA)

### Checklist for websites

- [ ] **Semantic structure:** landmarks (`header`, `nav`, `main`, `footer`), one `h1` per page, headings in order, real `<button>` and `<a>` elements, lists as lists.
- [ ] **Keyboard:** everything usable without a mouse, logical tab order, no keyboard traps, a skip-to-content link, and a **visible focus indicator** (2.1.1, 2.4.7, 2.4.11).
- [ ] **Text alternatives:** meaningful `alt` text on informative images, empty `alt=""` on decorative ones, and captions/transcripts for audio and video (1.1.1, 1.2).
- [ ] **Contrast:** 4.5:1 for normal text, 3:1 for large text and for UI components and focus indicators (1.4.3, 1.4.11). Never use color as the only way to convey meaning (1.4.1).
- [ ] **Forms:** visible labels tied to inputs, required fields marked in text, errors described in text next to the field and in a summary, `autocomplete` attributes on personal-data fields (1.3.5, 3.3.1–3.3.3).
- [ ] **Accessible authentication (3.3.8):** allow paste and password managers, and don't require puzzles or memory tests (no image CAPTCHAs).
- [ ] **Reflow and zoom:** usable at 320 px wide and 200% text size without losing content or scrolling in two directions (1.4.4, 1.4.10).
- [ ] **Target size:** interactive targets at least 24×24 CSS px (2.5.8). Don't rely on dragging alone (2.5.7).
- [ ] **Dynamic content:** status messages announced via `role="status"` or `aria-live` (4.1.3). Modals trap focus and return it on close.
- [ ] **Motion and time:** respect `prefers-reduced-motion`, no flashing content, and warn before session timeouts with a way to extend (2.2.1, 2.3.1).
- [ ] **Language:** `lang` attribute on the page, and page titles that describe each page (3.1.1, 2.4.2).
- [ ] **Consistent help and navigation:** help links and navigation in the same place on every page (3.2.3, 3.2.6).

### How to test

- [ ] Automated: axe-core (e.g. via Playwright) on every page in CI. It catches roughly a third of issues, so it's a floor, not a pass.
- [ ] Manual, per release: keyboard-only walkthrough of key journeys; NVDA (Windows) or VoiceOver (Mac) on core flows; 200% zoom and 320 px width check.
- [ ] A short accessibility statement page: target standard, known issues, and how to report a problem.

### Legal context

- **ADA Title III (US, private businesses):** courts and the DOJ commonly treat business websites and apps as places of public accommodation. Lawsuits usually cite **WCAG 2.1/2.2 AA** as the yardstick.
- **ADA Title II (US, state and local government):** the DOJ's 2024 rule requires **WCAG 2.1 AA** for web content and mobile apps, with compliance dates in April 2026 (populations of 50,000+) and April 2027 (smaller entities). Check for later DOJ changes before relying on these dates.
- **Section 508 (US federal agencies and their contractors):** requires WCAG 2.0 AA-level conformance.
- **European Accessibility Act:** since June 2025, many consumer digital services in the EU (e-commerce, banking, e-books, transport ticketing, and more) must be accessible, in practice EN 301 549 / WCAG 2.1 AA. Microenterprises providing services are exempt.
- **Target WCAG 2.2 AA:** it includes 2.1 AA and satisfies all of the above in practice.
