# Decisions already made — Phone app

Made in ArchitectCoach's wizard. Treat these as settled (see AGENTS.md, rule 1).
Cost figures are rough monthly ballparks as of October 2026; check current vendor pricing.

**Purpose:** _Not stated — ask the developer._

## Who is this app for?

**Chosen:** Internal employees or field workers

A tool for your own staff, often used in the field rather than at a desk.

**Tradeoffs:** Can skip public app-store distribution (using enterprise/internal distribution instead), but often needs to work reliably with poor connectivity.

**Alternatives not chosen:** General consumers (public app store); Your own customers (branded companion app); A small private group (friends, family, a club)

## What's the main goal for this app?

**Chosen:** Engage users with notifications or community features

Ongoing engagement (push notifications, feeds, social features) is central to the app's value.

**Tradeoffs:** Push notification infrastructure and moderation become real, ongoing responsibilities, not a one-time setup.

**Alternatives not chosen:** Provide on-the-go access to a service or content; Enable a specific task (e.g. tracking, ordering, booking); Support offline or field use where connectivity is unreliable

## How should this app be built?

**Chosen:** Web app wrapped as a mobile app (e.g. Capacitor/PWA)

An existing (or planned) web app packaged to install and run like a mobile app.

**Tradeoffs:** Fastest path if a web app already exists or is planned anyway, but feels and performs less native, especially for anything animation- or gesture-heavy.

**Alternatives not chosen:** Native (separate Swift/iOS and Kotlin/Android codebases); Cross-platform framework (e.g. React Native, Flutter)

### What this means in practice

- **Deployment complexity:** Low. A PWA deploys like a website with no store review. Wrapping it with Capacitor adds store submissions.
- **Accounts & integrations to manage:** Web hosting; Apple Developer Program (if in App Store); Google Play Console (if in Play). Store accounts are only needed if you publish to stores.
- **Ballpark cost:** Free. PWA-only can be free on a static host; store publishing adds the Apple/Google fees.
- **Security concerns:** Treat it like a website: HTTPS, a content security policy, no secrets in client code. Web storage is less protected than native secure storage.
- **Scalability:** High. Scales like a website.
- **Governance, risk & compliance:** Apple may reject apps that are 'just a website' — add real native value. PWAs avoid store policy entirely.
- **Auditing for correctness:** Web testing tools (Playwright, Lighthouse) plus checks on real devices.
- **Staying on top of costs:** Watch the web host's bandwidth and plan limits, plus yearly store fees if published to stores.
- **Performance:** Fine for forms and content; noticeably less smooth than native for animation-heavy UIs. iOS limits some PWA features.

## Does this app need a backend?

**Chosen:** Custom backend API you build and host yourself

You design and run your own server-side API for the app to talk to.

**Tradeoffs:** Full control over data and behavior, but it's effectively a second project (the backend) alongside the app itself.

**Alternatives not chosen:** No backend — fully local/offline app; Lightweight backend-as-a-service for sync/accounts (e.g. Supabase, Firebase)

### What this means in practice

- **Deployment complexity:** High. You build, deploy, and version an API — and old app versions stay in use for months, so the API must stay backward compatible.
- **Accounts & integrations to manage:** API hosting; Database; Auth provider or your own auth; Monitoring/error tracking. The full stack of a web backend.
- **Ballpark cost:** ~$50/mo. ~$10–50/mo for hosting and database at small scale, rising with users.
- **Security concerns:** Public API exposed to anyone who unpacks the app: authenticate every call, rate limit, and validate all input.
- **Scalability:** High. Scales as far as you build it to.
- **Governance, risk & compliance:** You are the data controller: privacy policy, account deletion, data-export requests, and breach response.
- **Auditing for correctness:** API tests, versioned contracts, and monitoring per API version to see which old app versions are still calling.
- **Staying on top of costs:** Billing alerts on hosting and database; watch egress from chatty mobile clients.
- **Performance:** Depends on your design; mobile networks are slow — keep payloads small and cache on the device.

## How do users sign in?

**Chosen:** Single sign-on with an existing company identity system

Employees or existing customers log in with credentials they already have.

**Tradeoffs:** No new credentials for users to manage, but only fits when that existing identity system is actually available to integrate with.

**Alternatives not chosen:** No accounts needed; Email/password or social login

### What this means in practice

- **Deployment complexity:** Medium. Register the app with the company's identity provider (Entra ID, Okta) and configure redirect URIs; often needs mobile device management (MDM) for distribution too.
- **Accounts & integrations to manage:** Company identity provider app registration; MDM or enterprise distribution (often). Coordination with the customer's IT team.
- **Ballpark cost:** Free. Usually covered by the company's existing identity licenses.
- **Security concerns:** Strong: MFA and conditional access come from the company's identity provider. Use the platform's secure browser flows (PKCE).
- **Scalability:** High. Scales with the identity provider.
- **Governance, risk & compliance:** Fits corporate compliance well; users are deprovisioned centrally when they leave.
- **Auditing for correctness:** Sign-in logs live in the identity provider; test with accounts that have MFA and conditional access.
- **Staying on top of costs:** Little direct cost; enterprise MDM may be licensed per device.
- **Performance:** Login may involve extra MFA steps; normal requests unaffected.

## Do you need push notifications?

**Chosen:** Rich in-app messaging/marketing platform (e.g. OneSignal, Braze)

A dedicated platform for push plus in-app messages, segmentation, and campaigns.

**Tradeoffs:** Much richer targeting and messaging tools out of the box, at the cost of a recurring bill and another vendor to integrate.

**Alternatives not chosen:** No push notifications needed; Standard push service (e.g. Firebase Cloud Messaging / Apple Push)

### What this means in practice

- **Deployment complexity:** Medium. Install the vendor SDK and connect it to APNs/FCM; marketers can then send without code changes.
- **Accounts & integrations to manage:** Messaging platform (e.g. OneSignal, Braze); Firebase project; Apple Push key. Often integrates with analytics and CRM tools as well.
- **Ballpark cost:** ~$10/mo. OneSignal has a free tier and paid plans from ~$10–$20/mo; Braze is enterprise-priced ($100+/mo).
- **Security concerns:** The SDK collects device and behavior data — limit what you send it; control who on the team can message all users.
- **Scalability:** High. Built for very large audiences.
- **Governance, risk & compliance:** Marketing messages need consent and opt-out; the vendor processes user profiles — sign the DPA and disclose it in privacy labels.
- **Auditing for correctness:** Use the vendor's delivery analytics; send test campaigns to internal devices before real users.
- **Staying on top of costs:** Pricing is usually by subscriber or message volume — check against the next tier.
- **Performance:** SDK adds some app size and startup work; delivery speed similar to standard push.

## Changes after the wizard

_Record any decision changed during spec/plan work here: what changed, why, and what it affects._
