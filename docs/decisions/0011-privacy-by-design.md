# ADR-0011: Privacy by design: minimal data, self-service rights, enforced retention

**Status:** Accepted
**Date:** 2026-10-18

## Context

Accounts (ADR-0010) make the site hold personal data: email addresses, password hashes, and
project text users type. An email address alone is personal data under GDPR and personal
information under CCPA, and an email + password(-hash) pair is covered by US state breach laws.
The owner wants the site GDPR- and CCPA-compliant.

## Decision

- **Collect only the email address.** The template's phone-number field was removed, and there
  are no names, analytics, tracking cookies, or ads. The only cookies are strictly necessary
  (sign-in, antiforgery), so no consent banner is needed. Adding analytics later reopens this.
- **Self-service rights in the app:**
  - *Export my data* (`DataExportService`): the account plus every project and decision, as JSON.
    Security secrets are deliberately excluded. The template's export included the TOTP
    authenticator key, which would let anyone holding the file generate the user's 2FA codes.
  - *Delete a project* (overview page, confirmation required).
  - *Delete my account*: immediate hard delete that cascades to all projects and decisions.
- **Notice:** `/privacy` (inventory, purposes, lawful bases, retention, processor, rights,
  no sale/sharing, 16+), a notice at collection on the registration form, and `/accessibility`.
  Operator name, contact email, and hosting region come from `Site:*` configuration, and
  Production logs a critical warning while they're empty.
- **Age:** registration requires confirming 16 or older (enforced server-side).
- **Retention:** unconfirmed accounts are deleted after 7 days (`RetentionService`, run at
  startup and daily by `RetentionWorker`). The new `ApplicationUser.CreatedAt` column supports it.
- **Logs never contain personal data.** This is checked by a test that captures every log
  message at Debug level through a full sign-up and sign-in.
- **Breach plan:** [docs/breach-response.md](../breach-response.md).

## Alternatives considered

- **Requests by email only** (no self-service export/delete): less code, but slower for users
  and easy to forget. Self-service is what regulators and users expect, and it's cheap here.
- **Soft delete with a grace period:** allows undo, but keeps data the user asked to erase and
  complicates retention. Rejected; deletion is immediate.
- **Keeping the template's export:** rejected because it omitted projects (incomplete for an
  access request) and included the authenticator key.

## Consequences

- The owner must fill in `Site:OperatorName`, `Site:PrivacyContactEmail`, and
  `Site:HostingRegion`, and get a short legal review of `/privacy`, before public launch.
- Database backups at the host still contain deleted data until they age out; the notice says
  so via the hosting provider's retention.
- Any new field holding personal data must be added to the privacy notice, the export, and
  the deletion path in the same change.
