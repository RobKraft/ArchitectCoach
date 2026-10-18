# ADR-0010: ASP.NET Core Identity (email + password) and server-enforced project ownership

**Status:** Accepted
**Date:** 2026-10-18

## Context

The Next.js app had no accounts: `GET /api/projects` returned every project to anyone. The owner
wants accounts available to as many people as possible, with no way for someone who bypasses the
UI to reach another user's data. Only an email address should be collected.

## Decision

**Accounts:** ASP.NET Core Identity with email + password, stored in our SQL Server. Email
confirmation is required before sign-in. Passwords need at least 12 characters with no
composition rules (NIST SP 800-63B), and paste and password managers are allowed. Lockout after
5 failures for 15 minutes. Optional authenticator-app 2FA and passkeys come from the .NET 10
template. Email goes through SMTP (MailKit, TLS required); development writes .eml files to a
pickup folder instead.

**Ownership, enforced in layers:**
1. **Fallback authorization policy:** every endpoint requires sign-in unless marked
   `[AllowAnonymous]`. The public list is pinned by `EndpointInventoryTests`.
2. **EF Core global query filters** on `Project` and `DecisionRecord`
   (`OwnerId == current user`), so a query that forgets a `Where` still returns nothing foreign.
3. **SaveChanges guard:** new projects are stamped with the current user, and creating one for
   someone else or changing an owner throws.
4. `OwnerId` is never bound from form data, and other users' data returns 404, not 403.

**Template hardening applied:** lockout enabled (the template had `lockoutOnFailure: false`);
removed the on-screen confirmation link (it let anyone confirm any address); registration and
its confirmation page no longer reveal whether an email is registered; passkey sign-in options
no longer look up the typed username; the email is no longer put in the post-registration URL;
the inline import map was removed so the CSP needs no `unsafe-inline`.

## Alternatives considered

- **Auth0 / Entra External ID:** offloads credential storage, but adds an external dependency and
  account for something Identity does well. Not needed at this scale.
- **Social login only (GitHub/Google):** no passwords stored, but excludes people without those
  accounts. The owner chose reach.
- **Ownership checks in each page:** one forgotten check leaks data. Rejected in favor of
  enforcing it in the data layer, plus tests that enumerate every endpoint.

## Consequences

- We hold email + password hashes. That's personal data under GDPR/CCPA and is covered by
  state breach-notification laws, so the privacy features in plan §7 and the breach plan are
  required before launch.
- Code that legitimately needs to see across users (an admin tool, the retention cleanup) must
  call `IgnoreQueryFilters()` explicitly, which makes it easy to find in review.
- The template's profile page still offers a phone-number field (beyond the "email only" goal).
  It's removed in Phase 4.
