# Breach response plan

What to do if ArchitectCoach's data may have been exposed: a leaked database or backup, a
compromised hosting or email account, or a bug that showed one user's data to another. Written
ahead of time so nobody has to work it out under pressure. (General guidance, not legal advice.
For a real incident affecting EU/UK or California users, get legal advice early.)

## What we hold

Per account: email address, password hash (PBKDF2, salted), security stamp, lockout counters,
optional 2FA authenticator key and passkey public keys, and the user's projects (type, a one-line
purpose they typed, wizard answers, decision records). No payment data, no names, no analytics.
An **email + password(-hash) combination** is covered by several US state breach laws
(including California's) even when the password is hashed.

## 1. Contain (first hour)

- [ ] Rotate every secret that could be involved: SQL Server password, SMTP password, SmarterASP
      control-panel password (and its 2FA), Web Deploy/FTP credentials.
- [ ] If the app itself is the problem (e.g. a cross-user data bug), take it offline, or deploy
      the last known-good version, until fixed.
- [ ] Invalidate all sessions if accounts may be affected: update every user's security stamp
      (`UPDATE AspNetUsers SET SecurityStamp = NEWID()`). Sign-ins re-validate within a minute.
- [ ] Preserve evidence before changing more: copy server logs and note the timeline.

## 2. Assess (within 24 hours)

- [ ] What data, and how many accounts? Which countries/states (from email domains, or ask)?
- [ ] Was it accessed, or only exposed? Is it still exposed?
- [ ] Is there a risk to people? (Hashed passwords are still a risk: reused passwords can be
      cracked offline.)
- [ ] Write it all down in the incident record (below), even if the conclusion is "no risk".

## 3. Notify

- [ ] **EU/UK users at risk:** notify the supervisory authority **within 72 hours** of becoming
      aware (GDPR Art. 33). If the risk to people is high, notify those users without undue delay
      (Art. 34).
- [ ] **US users:** notify affected residents as each state's law requires. California requires
      notice for email + password(-hash) combinations, and notice to the Attorney General if more
      than 500 California residents are affected.
- [ ] **Hosting provider:** tell SmarterASP if their systems were involved.
- [ ] User notice (plain language): what happened, what data, what we've done, what they should
      do (change that password anywhere it's reused, turn on 2FA), and a contact.

## 4. Fix and learn

- [ ] Fix the root cause, and add a regression test (for access bugs: extend
      `ProjectAccessTests` / `EndpointInventoryTests`).
- [ ] Short write-up: timeline, cause, impact, what changed. Update this plan if it was missing a step.

## Incident record

Keep one entry per incident, including suspected incidents that turned out to be nothing
(GDPR Art. 33(5) requires a record of every personal-data breach).

| Date found | What happened | Data / accounts affected | Notified (who, when) | Fix |
|---|---|---|---|---|
| | | | | |
