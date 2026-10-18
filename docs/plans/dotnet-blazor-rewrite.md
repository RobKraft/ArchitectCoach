# Plan: rewrite ArchitectCoach as ASP.NET Core Blazor + SQL Server

**Status:** Approved 2026-10-18. **Phases 1, 2a, 2b, and 3 done.** Phase 0: the owner chose to
*assume* A1 (.NET 10) and A3 (SMTP) work on SmarterASP and continue. The probe
(`dotnet/HostingProbe/`, [checklist](phase0-hosting-checklist.md)) should still be run before
launch. Next: Phase 4 (privacy features).
**Date:** 2026-10-18
**Target host:** SmarterASP.NET (Windows/IIS shared hosting, SQL Server, SMTP)

> Not legal advice. This plan builds the features GDPR and CCPA expect and documents the
> decisions, but "compliant" ultimately depends on how the site is operated (notices kept
> accurate, requests answered, breaches reported). Get a short legal review of the privacy notice
> before public launch.

---

## 1. Goals and non-goals

**Goals**
- Same product as today: the 5-project-type wizard, option assessments with compare table and
  deep dive, Decision Records, and the downloadable Spec Kit (plus Static website's tailored
  standards).
- Runs natively on SmarterASP: ASP.NET Core in IIS, SQL Server, SmarterASP SMTP.
- Email + password accounts. Every project belongs to exactly one user, and the server enforces
  that on every request, whatever the browser sends.
- Built for GDPR/CCPA from the start: data minimization, notice, access/export, deletion,
  retention, and a breach plan.
- The site itself meets **WCAG 2.2 AA**.
- The downloadable kit covers **privacy/PII (GDPR, CCPA) and accessibility (WCAG, ADA)** for
  every project type (section 9).

**Non-goals**
- Porting existing data. Local Postgres was wiped 2026-10-18; production starts empty.
- The AI chat interview, AI plan generation, and moderation gate. They're dropped because the
  wizard and Spec Kit replaced them, and no AI key will exist on the server.
- Social login, teams/sharing, payments. Any of these can be added later without redesign.

## 2. Assumptions to verify first (Phase 0)

| # | Assumption | How we check | If false |
|---|---|---|---|
| A1 | The SmarterASP plan runs **.NET 10** (current LTS) in-process under IIS | Control panel + deploy a hello-world | .NET 8 ends support Nov 2026, so ask support or move to a host that does |
| A2 | SQL Server 2016+ (EF Core JSON columns use `OPENJSON`) | Control panel shows the version | Store knowledge as `nvarchar(max)` and serialize by hand |
| A3 | SMTP host, port (587/465 with TLS), auth, **daily send limit**, SPF/DKIM for our domain | SmarterASP KB/support + a test send from the deployed app | Switch to Postmark/Resend; the email code is behind one interface, so only config changes |
| A4 | Which **datacenter region** the site and database live in | Control panel | Affects the privacy notice's international-transfer section (§7.6) |
| A5 | HTTPS with a free certificate on the custom domain | Control panel | Required; no launch without it |
| A6 | Deploy method (Web Deploy or FTP) and whether scheduled tasks can call a URL | Control panel | Retention cleanup runs on app start plus a protected admin action instead (§7.5) |

**Phase 0 is done when** a hello-world ASP.NET Core 10 app with a SQL Server connection and one
test email is live on the real domain over HTTPS.

## 3. Requirements

**Functional**
1. Register with email + password. Confirm the email before first sign-in. Sign in, sign out,
   forgot/reset password, change password, change email (re-confirmed).
2. Create a project by picking one of the 5 types (plus an optional one-line purpose). Answer the
   wizard step by step and resume later.
3. Every architecture/technology step shows the compare table and per-option deep dive (nine
   dimensions).
4. Requirements, Architecture, Technology, and Decision Records pages per project.
5. Download the Spec Kit ZIP for a finished project (all 5 types), with privacy and accessibility
   content (§9).
6. Account page: **export my data** (JSON), **delete my account** (account + all projects,
   immediately), delete individual projects.
7. Public pages: home, privacy notice, accessibility statement, sign-in/registration.

**Non-functional**
- **Security:** §6. OWASP ASVS level 1 as the checklist.
- **Privacy:** §7.
- **Accessibility:** WCAG 2.2 AA (§8).
- **Performance:** pages are server-rendered with no SignalR circuit. Target under 1 s for a
  page on shared hosting.
- **Operability:** survives IIS app-pool recycles with no lost state (all state is in SQL
  Server). Logs contain no emails, passwords, or tokens.

**Constraints:** shared IIS hosting, SQL Server, SmarterASP SMTP, a single developer, and no AI
on the server.

**Edge cases**
- Signing in before confirming the email.
- A reset link used twice or after it expires.
- Two browser tabs answering the same wizard step (the second gets "already answered", as today).
- Deleting an account while signed in on another device (that device's next request is rejected).
- Registering with an email that already exists. The message must not reveal whether the
  account exists.
- An SMTP outage. Registration still succeeds and the user can resend the confirmation email.

## 4. Architecture options considered

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **Blazor static SSR + forms** | No persistent connection, so it survives app-pool recycles. Plain HTML forms are easy to make accessible. Simplest security model | Less rich interactivity | **Chosen**: the wizard is click-and-post |
| Blazor Interactive Server | Rich interactivity in C# | A SignalR circuit per user; recycles drop users mid-wizard. More attack surface | Rejected |
| Blazor WebAssembly + Web API | Offloads work to the client | Needs a public JSON API, which is exactly the bypass risk we want to avoid; large download | Rejected |

Small client behaviors (copy to clipboard for "Discuss with my AI", opening the chosen AI) are a
few lines of plain JavaScript.

## 5. Solution structure

```
dotnet/                                  (same repo; Next.js code deleted at the end, §11)
  ArchitectCoach.sln
  src/ArchitectCoach.Web/                Blazor static SSR app (the only deployable)
    Components/Pages/                    Home, Projects/*, Account/*, Privacy, Accessibility
    Components/Shared/                   CompareTable, DeepDive, ChoiceCard, SidebarNav
    Data/                                AppDbContext (Identity + app tables), Migrations/
    Domain/                              Project, DecisionRecord, ProjectKnowledge (JSON-owned)
    Content/                             embedded JSON: wizard catalog, assessments, open questions,
                                         privacy/accessibility checklists (generated, §10)
    Services/                            WizardService, KitGenerator (Spec Kit + Dev Kit),
                                         DataExportService, AccountDeletionService, IEmailSender
    Security/                            owner query filter, auth policies, security headers
  tests/ArchitectCoach.Tests/            xUnit: content completeness, generators, wizard logic
  tests/ArchitectCoach.IntegrationTests/ WebApplicationFactory + real SQL Server: auth,
                                         cross-user isolation, endpoint inventory, privacy flows
  tests/ArchitectCoach.A11yTests/        Playwright for .NET + axe-core against every page
```

```
Browser ──HTML forms (antiforgery)──► ASP.NET Core (IIS, in-process)
                                        │ FallbackPolicy: authenticated user required
                                        │ Rate limiter: sign-in, register, reset, form posts
                                        ▼
                                 Razor components ──► Services ──► AppDbContext
                                                                     │ global filter:
                                                                     │ Project.OwnerId == current user
                                                                     ▼
                                                                SQL Server
                                 IEmailSender ──► SmarterASP SMTP (MailKit, TLS)
```

## 6. Security design

The browser is untrusted. Every rule is enforced on the server, and in more than one place.

1. **Signed in by default.** `FallbackPolicy = RequireAuthenticatedUser()`. Public pages are
   marked `[AllowAnonymous]` explicitly: home, privacy, accessibility, and the account pages.
2. **Owner scoping in the database layer.** `Project` has a required `OwnerId` (FK to
   `AspNetUsers`, cascade delete), plus an EF Core global query filter
   `p => p.OwnerId == _currentUserId`. `DecisionRecord` is only reachable through its project.
   A query that forgets a `Where` still can't return another user's rows.
3. **404, not 403,** for anything not owned, so existence isn't revealed. IDs are GUIDs as
   defense in depth, not as the protection.
4. **The server sets ownership.** `OwnerId` comes from the authenticated principal and is never
   bound from form data. Form models bind an explicit allow-list of fields.
5. **No public JSON API.** Pages read data server-side. The remaining POST/GET endpoints (wizard
   answer, kit download, export, delete) all go through the owner filter.
6. **Antiforgery** on every form (built into Blazor SSR forms). Cookies: `HttpOnly`, `Secure`,
   `SameSite=Lax`.
7. **Passwords (ASP.NET Core Identity):** PBKDF2 hashing (Identity default); minimum 12
   characters, no forced composition rules (per NIST SP 800-63B); paste allowed so password
   managers work. Lockout after 5 failures for 15 minutes. Confirmed email required. Optional
   authenticator-app 2FA. Security stamp validation, so deleting an account or changing its
   password signs out other devices.
8. **Rate limiting** (built-in middleware) on register, sign-in, forgot-password, resend
   confirmation, and all POSTs.
9. **Security headers:** HSTS, a CSP with no inline script (the small JS is a static file),
   `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`,
   `frame-ancestors 'none'`.
10. **Secrets** (connection string, SMTP password) are kept out of git, in the host's
    configuration or an `appsettings.Production.json` that's never committed.

**Proven by tests** (`ArchitectCoach.IntegrationTests`):
- **Cross-user isolation:** user B gets 404 for user A's project pages, wizard-answer POST, kit
  download, and decision pages.
- **Signed-out access:** every private route redirects to sign-in.
- **Endpoint inventory:** enumerates every endpoint in the app and fails if any one lacks an
  auth requirement and isn't on the explicit public list. This catches holes added in the
  future.
- **Over-posting:** posting an `OwnerId` or another user's project ID has no effect.
- **Account deletion:** after deletion, no rows remain for that user and the old cookie is
  rejected.

## 7. Privacy: GDPR and CCPA

### 7.1 Data inventory (what we hold, and nothing more)

| Data | Why | Lawful basis (GDPR) | Kept |
|---|---|---|---|
| Email address | Account identity, sign-in, password reset | Contract (providing the service) | Until account deletion |
| Password hash, security stamp, lockout counters, optional 2FA secret | Account security | Contract | Until account deletion |
| Projects (type, purpose text, answers, decisions) | The service itself | Contract | Until the project or account is deleted |
| Auth and antiforgery cookies | Keep users signed in, prevent CSRF | Strictly necessary, so no consent needed | Session / 14 days |
| Server/IIS logs (IP, time, URL) | Security and troubleshooting | Legitimate interest | Host's retention; app logs 30 days, no emails |

No analytics, no tracking cookies, no advertising, no profiling, and **no selling or sharing**
(in CCPA's sense). **No cookie banner is needed** because only strictly-necessary cookies are
used. Adding analytics later reopens this.

### 7.2 Notice

- `/privacy` page: who runs the site and a contact email, the inventory above, purposes and
  lawful bases, retention, processors (SmarterASP for hosting, database, and email), where data
  is stored (A4), rights and how to exercise them, the right to complain to a supervisory
  authority, no sale/sharing, minimum age 16, and the last-updated date.
- **Notice at collection** (CCPA): a one-line summary with a link to `/privacy` on the
  registration form.

### 7.3 Rights, built into the app (self-service)

| Right | GDPR | CCPA | How |
|---|---|---|---|
| Access / portability / know | Art. 15, 20 | Right to know | **Export my data**: a JSON download of the account email, created date, and all projects with their decisions |
| Rectification / correct | Art. 16 | Right to correct | Change email (re-confirmed); edit or delete projects |
| Erasure / delete | Art. 17 | Right to delete | **Delete my account**: immediate hard delete of the user and cascade to all projects (one transaction), then signed out |
| Object / opt-out of sale or sharing | Art. 21 | Opt-out | Not applicable (no sale/sharing, no profiling); stated in the notice |
| Non-discrimination | n/a | Yes | Nothing is gated on exercising rights |

Requests by email (for anyone locked out) are answered within 30 days (GDPR) / 45 days (CCPA)
and logged in a simple register, without copying the user's data into the log.

### 7.4 Minimization and privacy by design
- Registration asks for email and password only: no name, phone, or demographics.
- Free-text purpose field: helper text says not to enter personal or confidential information.
- Logs never include emails, passwords, tokens, or project content. A test checks log output
  after a full sign-up flow.
- Ages: the terms state 16+, the site isn't directed at children, and there's a registration
  checkbox confirming it.

### 7.5 Retention
- Unconfirmed accounts are deleted after 7 days.
- Deleted accounts are removed immediately, with no soft delete. Database backups age out on
  the host's backup schedule (stated in the notice).
- Cleanup runs on app start and daily via a host scheduled task if A6 allows; otherwise from a
  protected admin action.

### 7.6 Processors and transfers
- SmarterASP is the processor (hosting, database, email). Check their terms for a data
  processing agreement and note it in the notice.
- If hosted in the US and EU users sign up, the notice must describe the international transfer.
  If SmarterASP offers an EU datacenter, choosing it simplifies this (decision for the owner).

### 7.7 Breach plan (`docs/breach-response.md`)
Contain (rotate secrets, disable affected accounts), assess what was exposed, then notify: the
supervisory authority within 72 hours if EU/UK users are at risk (GDPR Art. 33), affected users
without undue delay, and per US state law (an email + password combination is covered in
several states, including California). Write it down and keep a record.

### 7.8 CCPA applicability, honestly
CCPA's obligations legally apply to for-profit businesses above its thresholds (revenue, volume
of consumers' data, or revenue from selling/sharing data). A free community tool is likely
below them. We implement its rights anyway because it costs almost nothing on top of GDPR.

## 8. Accessibility: WCAG 2.2 AA for this site

- Semantic HTML: landmarks, one `h1` per page, real `<button>`/`<a>`, `<fieldset>`/`<legend>`
  for each wizard question, and table headers with `scope` in the compare table.
- Keyboard: everything reachable and usable, a visible focus indicator (2.4.7, 2.4.11), a
  skip-to-content link, and no keyboard traps. Disclosure widgets use `<details>`/`<summary>`.
- Forms: visible labels, errors identified in text and linked with `aria-describedby`, and an
  error summary with focus moved to it (3.3.1, 3.3.3).
- **Accessible authentication (3.3.8):** paste allowed, password managers supported, no
  CAPTCHA puzzles. Rate limiting is the abuse defense.
- Contrast: 4.5:1 for text and 3:1 for UI components. The compare-table badges never rely on
  color alone; the text ("Low complexity") carries the meaning.
- Reflow at 320 px wide and 200% text zoom with no loss, and target size of at least 24×24 px
  (2.5.8).
- Status messages (e.g. "Answer saved") use `role="status"`.
- `/accessibility` statement: target standard, known issues, and how to report a problem.
- **Testing:** axe-core via Playwright for .NET against every page, signed in and out, in CI.
  Plus a manual pass before launch: keyboard only, NVDA on Windows, 200% zoom, phone width.

## 9. Spec Kit additions: privacy, PII, and accessibility for every project type

Today the kit asks which laws apply and mentions privacy in each option's notes, but it has no
dedicated privacy/PII or accessibility guidance. Only Static website gets an accessibility
checklist, and the constitution doesn't require either. Added for all 5 types:

- **`architectcoach/privacy-and-accessibility.md`**, generated per project type:
  - **PII inventory template:** each data item, why it's collected, lawful basis, retention,
    who can access it, and which processors receive it.
  - **GDPR checklist:** minimization, lawful basis, notice, data-subject rights (access, export,
    erase, correct), retention, processors and DPAs, international transfers, breach plan within
    72 hours, consent for non-essential cookies.
  - **CCPA checklist:** applicability thresholds, notice at collection, rights to
    know/delete/correct, "Do Not Sell or Share" if applicable, non-discrimination, 45-day
    response.
  - **Accessibility:** WCAG 2.2 AA checklist tailored per type. Web types use WCAG directly.
    Phone apps map it to iOS VoiceOver/Android TalkBack, Dynamic Type, and touch-target sizes.
    Desktop apps map it to the platform accessibility APIs (UI Automation, macOS Accessibility)
    and high-contrast modes.
  - **Legal context:** ADA Title III (private businesses' websites are commonly treated as
    covered), the DOJ's 2024 Title II rule (state/local government sites must meet WCAG 2.1 AA,
    from April 2026 for larger entities and April 2027 for smaller), the European Accessibility
    Act (in force since June 2025 for many consumer digital services in the EU), and Section 508
    for US federal work.
- **Constitution:** two principles in every kit, whatever the options: *Privacy by design*
  (collect the minimum; every personal-data field needs a purpose, retention, and deletion path)
  and *Accessible by default* (WCAG 2.2 AA is part of "done" for every UI task).
- **Open questions** (new): where are users located (EU/UK/California)? Will children use it?
  Which personal-data fields, and what's the retention for each? Which assistive technologies
  will you test with? Do you sell or share data, or use advertising/analytics cookies?
- **AGENTS.md:** the plan must include a PII inventory and an accessibility test approach. Every
  UI task's "done" check includes a keyboard + automated a11y check, and every task that touches
  personal data names its retention and deletion path.

This content is written into the current TypeScript catalog first (Phase 2a), so it's covered by
the existing completeness tests and then converted with everything else.

## 10. Content conversion (no retyping)

`scripts/export-content.ts` (run once with the current Next.js code) writes the wizard catalog,
assessments, open questions, and the §9 additions to JSON under `dotnet/src/.../Content/`. C#
records mirror the TypeScript types. The xUnit completeness tests replicate today's checks: every
assessed option complete, every question key valid, one recommended option at most, unique IDs.
After conversion, the JSON files are the source of truth and the TypeScript is deleted.

## 11. Phases and acceptance criteria

| Phase | Work | Done when |
|---|---|---|
| **0. Hosting check** | §2 A1–A6 on the real SmarterASP account | Hello-world + SQL + test email live over HTTPS |
| **1. Skeleton + security** | Solution, Identity (email confirm, reset, lockout, 2FA optional), SMTP sender, fallback policy, rate limits, headers, owner filter, local SQL Server | Endpoint-inventory and signed-out tests pass; register → confirm → sign in works locally |
| **2a. Kit content** (in current TS) | §9 privacy/PII/accessibility content + tests | New tests pass in the current app |
| **2b. Content + wizard** | Export script, Content JSON, WizardService, project pages, compare table, deep dive | Completeness tests pass; all 5 types can be completed; cross-user tests pass |
| **3. Kits** | Spec Kit + Static website Dev Kit generator, ZIP download | Generated kits match the current app's output for the same answers (golden-file tests) |
| **4. Privacy features** | Export, delete account/project, privacy and accessibility pages, retention cleanup, breach doc, log-scrubbing test | Privacy integration tests pass; notice reviewed by owner |
| **5. Accessibility** | axe suite on every page, manual pass, fixes | Zero axe violations; manual checklist signed off |
| **6. Launch** | Deploy, SPF/DKIM, smoke test on production, retire Next.js (delete code, Docker Postgres) | Production smoke test passes; docs updated |

## 12. Testing summary
- **Unit (xUnit):** content completeness, generators (golden files), wizard step logic, export
  JSON shape.
- **Integration (WebApplicationFactory + SQL Server in Docker or LocalDB):** auth flows,
  cross-user isolation, endpoint inventory, over-posting, deletion cascade, export completeness,
  log scrubbing, rate limiting.
- **Accessibility:** Playwright + axe, every page, signed in and out.
- **Manual before launch:** keyboard/NVDA pass, phone width, real email deliverability (lands in
  inbox, not spam).

## 13. Documentation updates
- **ADR-0009:** rewrite to ASP.NET Core Blazor SSR + SQL Server on SmarterASP. Supersedes
  ADR-0002, 0003, 0004, and 0006, and amends 0001 (EF Core JSON column) and 0005 (ports).
- **ADR-0010:** ASP.NET Core Identity with email + password (vs Auth0, vs social-only).
- **ADR-0011:** privacy design (inventory, rights, retention).
- Rewrite `REQUIREMENTS.md`, `ARCHITECTURE.md`, `docs/security-checklist.md`, and
  `docs/local-setup-checklist.md`. Add `docs/breach-response.md`, `/privacy`, and
  `/accessibility`. Update `CLAUDE.md` and `STATUS.md`.

## 14. Decisions needed from the owner
1. **Contact email** for privacy requests (shown on `/privacy`).
2. **Datacenter region:** US or EU (if SmarterASP offers EU).
3. **Domain** for the site.
4. **Minimum age:** 16 is proposed (simplest under GDPR across the EU).
5. **Who reviews** the privacy notice before launch.
