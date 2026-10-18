# Technical context

Give this to `/speckit.plan`, together with the answered "plan" questions in `open-questions.md`.

## Chosen technology and architecture

| Decision | Chosen | Deployment complexity | Ballpark cost | Scalability |
|---|---|---|---|---|
| How should this app be built? | Cross-platform UI framework compiled natively (e.g. .NET MAUI, Flutter Desktop) | Medium | ~$10/mo | High |
| Does it need local data storage? | Syncs with a cloud backend/database | High | ~$10/mo | High |
| How will people install and update it? | Auto-update built into the app (e.g. Squirrel, Sparkle) | Medium | ~$10/mo | High |
| Does the app require user accounts? | Required company or SSO login | Medium | Free | High |

Cost buckets are rough monthly figures as of October 2026.

## Accounts and integrations the plan must cover

Each needs an owner, credentials stored safely, and (if paid) a budget alert:

- Code-signing certificate (Windows)
- Apple Developer Program
- CI with Mac and Windows runners
- Backend hosting or BaaS
- Cloud database
- Auth provider
- Update feed hosting (e.g. GitHub Releases, S3)
- Code-signing certificates
- Company identity provider app registration

## The plan must include

- Environments and how code gets from a commit to production.
- Where secrets live, and who has access to each account above.
- Monitoring and alerting for errors, uptime, and cost.
- Backups and a tested restore, if any data is stored.
- How each security and compliance principle in the constitution is met.
- Specific tools where the wizard only chose a category (see the "plan" questions).
