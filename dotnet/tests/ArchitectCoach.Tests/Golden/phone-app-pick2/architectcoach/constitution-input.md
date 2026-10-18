# Constitution input — Phone app

Give this to `/speckit.constitution`, together with the answers to the budget, compliance,
sensitive-data, user-location, accessibility, and performance questions in `open-questions.md`.
These are the principles every spec, plan, and task must respect.

## 1. The architecture decisions are binding

- Who is this app for? → **Internal employees or field workers**
- What's the main goal for this app? → **Engage users with notifications or community features**
- How should this app be built? → **Web app wrapped as a mobile app (e.g. Capacitor/PWA)**
- Does this app need a backend? → **Custom backend API you build and host yourself**
- How do users sign in? → **Single sign-on with an existing company identity system**
- Do you need push notifications? → **Rich in-app messaging/marketing platform (e.g. OneSignal, Braze)**

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

- _Web app wrapped as a mobile app (e.g. Capacitor/PWA):_ Treat it like a website: HTTPS, a content security policy, no secrets in client code. Web storage is less protected than native secure storage.
- _Custom backend API you build and host yourself:_ Public API exposed to anyone who unpacks the app: authenticate every call, rate limit, and validate all input.
- _Single sign-on with an existing company identity system:_ Strong: MFA and conditional access come from the company's identity provider. Use the platform's secure browser flows (PKCE).
- _Rich in-app messaging/marketing platform (e.g. OneSignal, Braze):_ The SDK collects device and behavior data — limit what you send it; control who on the team can message all users.

## 7. Governance, risk & compliance

- _Web app wrapped as a mobile app (e.g. Capacitor/PWA):_ Apple may reject apps that are 'just a website' — add real native value. PWAs avoid store policy entirely.
- _Custom backend API you build and host yourself:_ You are the data controller: privacy policy, account deletion, data-export requests, and breach response.
- _Single sign-on with an existing company identity system:_ Fits corporate compliance well; users are deprovisioned centrally when they leave.
- _Rich in-app messaging/marketing platform (e.g. OneSignal, Braze):_ Marketing messages need consent and opt-out; the vendor processes user profiles — sign the DPA and disclose it in privacy labels.

## 8. Cost guardrails

Set a budget alert on every paid account at the monthly limit from `open-questions.md`.

- _Web app wrapped as a mobile app (e.g. Capacitor/PWA):_ Watch the web host's bandwidth and plan limits, plus yearly store fees if published to stores.
- _Custom backend API you build and host yourself:_ Billing alerts on hosting and database; watch egress from chatty mobile clients.
- _Single sign-on with an existing company identity system:_ Little direct cost; enterprise MDM may be licensed per device.
- _Rich in-app messaging/marketing platform (e.g. OneSignal, Braze):_ Pricing is usually by subscriber or message volume — check against the next tier.

## 9. Auditing for correctness

- _Web app wrapped as a mobile app (e.g. Capacitor/PWA):_ Web testing tools (Playwright, Lighthouse) plus checks on real devices.
- _Custom backend API you build and host yourself:_ API tests, versioned contracts, and monitoring per API version to see which old app versions are still calling.
- _Single sign-on with an existing company identity system:_ Sign-in logs live in the identity provider; test with accounts that have MFA and conditional access.
- _Rich in-app messaging/marketing platform (e.g. OneSignal, Braze):_ Use the vendor's delivery analytics; send test campaigns to internal devices before real users.

## 10. Performance

- _Web app wrapped as a mobile app (e.g. Capacitor/PWA):_ Fine for forms and content; noticeably less smooth than native for animation-heavy UIs. iOS limits some PWA features.
- _Custom backend API you build and host yourself:_ Depends on your design; mobile networks are slow — keep payloads small and cache on the device.
- _Single sign-on with an existing company identity system:_ Login may involve extra MFA steps; normal requests unaffected.
- _Rich in-app messaging/marketing platform (e.g. OneSignal, Braze):_ SDK adds some app size and startup work; delivery speed similar to standard push.
