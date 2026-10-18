# Technical context

Give this to `/speckit.plan`, together with the answered "plan" questions in `open-questions.md`.

## Chosen technology and architecture

| Decision | Chosen | Deployment complexity | Ballpark cost | Scalability |
|---|---|---|---|---|
| How should this app be built? | Cross-platform framework (e.g. React Native, Flutter) | Medium | ~$10/mo | High |
| Does this app need a backend? | Lightweight backend-as-a-service for sync/accounts (e.g. Supabase, Firebase) | Low | Free | High |
| How do users sign in? | Email/password or social login | Medium | Free | High |
| Do you need push notifications? | Standard push service (e.g. Firebase Cloud Messaging / Apple Push) | Medium | Free | High |

Cost buckets are rough monthly figures as of October 2026.

## Accounts and integrations the plan must cover

Each needs an owner, credentials stored safely, and (if paid) a budget alert:

- Apple Developer Program
- Google Play Console
- Code-signing certificates and keys
- Build service (e.g. Expo EAS, Codemagic)
- BaaS account (e.g. Supabase, Firebase)
- Auth provider (Firebase Auth, Supabase, Auth0, etc.)
- Apple Sign in setup
- Google OAuth setup
- Firebase project (FCM)
- Apple Push Notification key
- A backend to send from

## The plan must include

- Environments and how code gets from a commit to production.
- Where secrets live, and who has access to each account above.
- Monitoring and alerting for errors, uptime, and cost.
- Backups and a tested restore, if any data is stored.
- How each security and compliance principle in the constitution is met.
- Specific tools where the wizard only chose a category (see the "plan" questions).
