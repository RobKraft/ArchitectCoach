# Technical context

Give this to `/speckit.plan`, together with the answered "plan" questions in `open-questions.md`.

## Chosen technology and architecture

| Decision | Chosen | Deployment complexity | Ballpark cost | Scalability |
|---|---|---|---|---|
| What architecture style fits best? | Modular monolith — one deployable, cleanly separated internal modules | Low | ~$10/mo | Medium |
| Which database fits best? | MySQL (relational) | Medium | ~$10/mo | High |
| How should users log in? | Managed auth provider (e.g. Auth0, Clerk, Supabase Auth) | Low | Free | High |
| Where should this be hosted? | Traditional cloud VM (AWS EC2, DigitalOcean Droplet, etc.) | High | ~$10/mo | Medium |

Cost buckets are rough monthly figures as of October 2026.

## Accounts and integrations the plan must cover

Each needs an owner, credentials stored safely, and (if paid) a budget alert:

- App hosting
- Database
- Domain registrar
- Managed MySQL provider (e.g. PlanetScale, RDS, Azure)
- Auth provider (e.g. Auth0, Clerk, Supabase Auth)
- Cloud provider account
- Backup solution

## The plan must include

- Environments and how code gets from a commit to production.
- Where secrets live, and who has access to each account above.
- Monitoring and alerting for errors, uptime, and cost.
- Backups and a tested restore, if any data is stored.
- How each security and compliance principle in the constitution is met.
- Specific tools where the wizard only chose a category (see the "plan" questions).
