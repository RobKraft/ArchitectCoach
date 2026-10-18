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

### Q15. How are posts organized — categories, tags, series — and what does a post page show?

_phase: spec_ — Defines URL structure and the templates to build.

**Answer:** _(pending)_

### Q16. How many authors, and is there a draft → review → publish workflow?

_phase: spec_ — Decides whether git-based publishing is workable or authors need a CMS UI.

**Answer:** _(pending)_

### Q17. Do readers need RSS, an email newsletter, or both?

_phase: spec_ — Newsletters add a vendor and personal-data handling; RSS is free.

**Answer:** _(pending)_

### Q18. What content types and fields does the CMS need (post, author, category, image fields)?

_phase: spec_ — This is the CMS content model — the equivalent of a database schema.

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

### Q24. Are there existing posts to migrate, and do old URLs need redirects?

_phase: plan_ — Broken old links lose search ranking — redirects must be part of the plan.

**Answer:** _(pending)_

### Q25. Which headless CMS, and how does publishing trigger a rebuild?

_phase: plan_ — The webhook between CMS and host is the most common silent failure.

**Answer:** _(pending)_
