# Technical context

Give this to `/speckit.plan`, together with the answered "plan" questions in `open-questions.md`.

## Chosen technology and architecture

| Decision | Chosen | Deployment complexity | Ballpark cost | Scalability |
|---|---|---|---|---|
| What architecture style fits best? | Separate frontend and API backend (two deployables) | Medium | ~$10/mo | High |
| Which database fits best? | MongoDB (document) | Medium | ~$10/mo | High |
| How should users log in? | Social login only (Google/GitHub/etc. via OAuth) | Low | Free | High |
| Where should this be hosted? | Managed container platform (e.g. Render, Fly.io, Railway) | Medium | ~$10/mo | High |

Cost buckets are rough monthly figures as of October 2026.

## Accounts and integrations the plan must cover

Each needs an owner, credentials stored safely, and (if paid) a budget alert:

- Frontend hosting
- API hosting
- Database
- Domain registrar (plus DNS for api.* subdomain)
- MongoDB Atlas (or another host)
- Developer accounts with each provider (Google, GitHub, etc.)
- Container platform account
- Database (often same platform)
- Domain registrar

## The plan must include

- Environments and how code gets from a commit to production.
- Where secrets live, and who has access to each account above.
- Monitoring and alerting for errors, uptime, and cost.
- Backups and a tested restore, if any data is stored.
- How each security and compliance principle in the constitution is met.
- Specific tools where the wizard only chose a category (see the "plan" questions).
