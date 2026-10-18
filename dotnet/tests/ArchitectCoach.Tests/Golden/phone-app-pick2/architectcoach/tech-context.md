# Technical context

Give this to `/speckit.plan`, together with the answered "plan" questions in `open-questions.md`.

## Chosen technology and architecture

| Decision | Chosen | Deployment complexity | Ballpark cost | Scalability |
|---|---|---|---|---|
| How should this app be built? | Web app wrapped as a mobile app (e.g. Capacitor/PWA) | Low | Free | High |
| Does this app need a backend? | Custom backend API you build and host yourself | High | ~$50/mo | High |
| How do users sign in? | Single sign-on with an existing company identity system | Medium | Free | High |
| Do you need push notifications? | Rich in-app messaging/marketing platform (e.g. OneSignal, Braze) | Medium | ~$10/mo | High |

Cost buckets are rough monthly figures as of October 2026.

## Accounts and integrations the plan must cover

Each needs an owner, credentials stored safely, and (if paid) a budget alert:

- Web hosting
- Apple Developer Program (if in App Store)
- Google Play Console (if in Play)
- API hosting
- Database
- Auth provider or your own auth
- Monitoring/error tracking
- Company identity provider app registration
- MDM or enterprise distribution (often)
- Messaging platform (e.g. OneSignal, Braze)
- Firebase project
- Apple Push key

## The plan must include

- Environments and how code gets from a commit to production.
- Where secrets live, and who has access to each account above.
- Monitoring and alerting for errors, uptime, and cost.
- Backups and a tested restore, if any data is stored.
- How each security and compliance principle in the constitution is met.
- Specific tools where the wizard only chose a category (see the "plan" questions).
