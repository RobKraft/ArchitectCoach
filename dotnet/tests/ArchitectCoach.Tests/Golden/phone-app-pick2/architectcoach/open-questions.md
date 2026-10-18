# Open questions

ArchitectCoach's wizard settled the main architecture choices. These questions are still open.
Your AI agent asks them one at a time and writes each answer here (see AGENTS.md).

## Spec questions — answer before/during `/speckit.specify` and `/speckit.clarify`

### Q01. What are the 3–5 most important things a user does, start to finish?

_phase: spec_ — Each becomes a user story with acceptance criteria — the backbone of spec.md and the task list.

**Answer:** _(pending)_

### Q02. What is explicitly NOT in the first release?

_phase: spec_ — Writing down non-goals is the cheapest way to stop scope creep and keep the task list short.

**Answer:** _(pending)_

### Q03. How will you know the first release worked — what number or observable outcome?

_phase: spec_ — Turns 'done' into something testable and tells you what to measure after launch.

**Answer:** _(pending)_

### Q04. Roughly how many users or visitors per month in the first year, and what's the busiest moment likely to be?

_phase: spec_ — Drives scalability and cost: it decides whether free tiers are enough and what to load-test.

**Answer:** _(pending)_

### Q05. What's the most you're willing to spend per month on hosting and services before you want to be alerted?

_phase: spec_ — Becomes the budget alert threshold on every paid account — the main defense against surprise bills.

**Answer:** _(pending)_

### Q06. What personal or sensitive data will you store or process (emails, payment info, health, location, children's data)?

_phase: spec_ — Sets the security baseline and decides which privacy obligations apply.

**Answer:** _(pending)_

### Q07. Which laws, policies, or standards apply — GDPR/UK GDPR, CCPA, HIPAA, accessibility (WCAG), app-store policies, your company's policies?

_phase: spec_ — Governance, risk & compliance requirements are far cheaper to design in than to retrofit.

**Answer:** _(pending)_

### Q08. Where will your users be — EU/UK, California or other US states, elsewhere?

_phase: spec_ — Decides which privacy laws apply (GDPR, CCPA and similar state laws) and whether international data transfers need covering in the privacy notice.

**Answer:** _(pending)_

### Q09. List every piece of personal data you'll collect, and for each: why, and how long you'll keep it.

_phase: spec_ — This becomes the PII inventory. Each field needs a purpose, a retention period, and a deletion path; anything without a purpose shouldn't be collected.

**Answer:** _(pending)_

### Q10. Could children (under 16) use it?

_phase: spec_ — Children's data brings parental-consent rules (GDPR, COPPA in the US). Most projects state a minimum age and don't target children.

**Answer:** _(pending)_

### Q11. Will you use analytics, advertising, or tracking cookies or pixels, or sell or share personal data with anyone?

_phase: spec_ — Tracking needs opt-in consent in the EU/UK; selling or sharing triggers CCPA's "Do Not Sell or Share" obligations.

**Answer:** _(pending)_

### Q12. Which accessibility standard will you meet (WCAG 2.2 AA is recommended), and do any users rely on assistive technology you know of?

_phase: spec_ — Accessibility is required in many places (ADA, the European Accessibility Act) and far cheaper to build in than to retrofit.

**Answer:** _(pending)_

### Q13. What would 'wrong' look like — which errors would hurt users most, and how should they be caught?

_phase: spec_ — Defines how you audit for correctness: which tests, validations, and alerts matter most.

**Answer:** _(pending)_

### Q14. What speed is acceptable — page/screen load and action response times on a typical device and connection?

_phase: spec_ — Gives performance a concrete target the plan and tests can check against.

**Answer:** _(pending)_

### Q15. List the main screens and how users move between them.

_phase: spec_ — The screen map is the skeleton of the spec and the task list.

**Answer:** _(pending)_

### Q16. What must work offline, and what happens when the connection returns?

_phase: spec_ — Offline behavior changes data storage and sync design significantly.

**Answer:** _(pending)_

### Q17. Which device features are needed (camera, location, contacts, biometrics)?

_phase: spec_ — Each needs a permission prompt, a privacy-label entry, and a store-review justification.

**Answer:** _(pending)_

### Q18. Which events trigger a notification, who can send marketing messages, and how do users opt out?

_phase: spec_ — Marketing messages need consent and an opt-out.

**Answer:** _(pending)_

## Plan questions — answer before `/speckit.plan`

### Q19. Which environments do you need (local, preview/staging, production), and who is allowed to deploy to production?

_phase: plan_ — Shapes the deployment pipeline and the access-control part of the plan.

**Answer:** _(pending)_

### Q20. Who owns each account (hosting, domain, third-party services), and where will credentials and secrets be stored?

_phase: plan_ — Every component is an account someone must secure, pay for, and hand over if they leave.

**Answer:** _(pending)_

### Q21. Who gets alerted when the site/app breaks or costs spike, and how (email, Slack, SMS)?

_phase: plan_ — Monitoring without a recipient is just logging — this wires auditing and cost monitoring to a person.

**Answer:** _(pending)_

### Q22. How will accessibility be tested — which automated tools, and which screen readers and devices for the manual pass?

_phase: plan_ — Automated tools catch only about a third of issues; naming the manual checks puts them in the task list instead of leaving them to chance.

**Answer:** _(pending)_

### Q23. Is there a deadline, and how many people (and AI agents) are building this?

_phase: plan_ — Decides how finely tasks are split and which can run in parallel.

**Answer:** _(pending)_

### Q24. Which platforms and minimum OS versions must be supported?

_phase: plan_ — Determines testing effort and which APIs are available.

**Answer:** _(pending)_

### Q25. How will beta testing work (TestFlight, Play internal testing), and how are crashes reported?

_phase: plan_ — Store review delays mean bugs must be caught before release.

**Answer:** _(pending)_

### Q26. How will you force or encourage updates when an old app version breaks?

_phase: plan_ — Old versions stay installed for months; the backend must handle them or block them.

**Answer:** _(pending)_

### Q27. How long will old app versions be supported by the API?

_phase: plan_ — Mobile users don't update promptly — the API must stay backward compatible.

**Answer:** _(pending)_

### Q28. Which identity provider, and is mobile device management (MDM) required?

_phase: plan_ — Corporate SSO usually comes with distribution and device-policy requirements.

**Answer:** _(pending)_
