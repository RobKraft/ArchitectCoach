# Technical context

Give this to `/speckit.plan`, together with the answered "plan" questions in `open-questions.md`.

## Chosen technology and architecture

| Decision | Chosen | Deployment complexity | Ballpark cost | Scalability |
|---|---|---|---|---|
| How should this app be built? | Cross-platform desktop framework (e.g. Electron, Tauri) | Medium | ~$10/mo | High |
| Does it need local data storage? | Embedded local database (e.g. SQLite) | Low | Free | Medium |
| How will people install and update it? | Platform app store (Microsoft Store / Mac App Store) | Medium | ~$10/mo | High |
| Does the app require user accounts? | Optional account for syncing or cloud features | Medium | Free | High |

Cost buckets are rough monthly figures as of October 2026.

## Accounts and integrations the plan must cover

Each needs an owner, credentials stored safely, and (if paid) a budget alert:

- Code-signing certificate (Windows)
- Apple Developer Program
- CI with Mac and Windows runners
- Microsoft Partner Center
- Auth provider (e.g. Auth0, Supabase Auth)

## The plan must include

- Environments and how code gets from a commit to production.
- Where secrets live, and who has access to each account above.
- Monitoring and alerting for errors, uptime, and cost.
- Backups and a tested restore, if any data is stored.
- How each security and compliance principle in the constitution is met.
- Specific tools where the wizard only chose a category (see the "plan" questions).
