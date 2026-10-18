# Technical context

Give this to `/speckit.plan`, together with the answered "plan" questions in `open-questions.md`.

## Chosen technology and architecture

| Decision | Chosen | Deployment complexity | Ballpark cost | Scalability |
|---|---|---|---|---|
| How should this site be built? | Component framework exported as static files (e.g. Next.js/Astro static export) | Medium | Free | High |
| Where should this site be hosted? | Vercel | Low | Free | High |
| Do you need visitor analytics? | Google Analytics | Low | Free | High |

Cost buckets are rough monthly figures as of October 2026.

## Accounts and integrations the plan must cover

Each needs an owner, credentials stored safely, and (if paid) a budget alert:

- Git repository (e.g. GitHub)
- Hosting account
- Domain registrar
- Vercel account
- Git repository
- Google account (Analytics property)
- Cookie-consent tool (if you have EU visitors)

## The plan must include

- Environments and how code gets from a commit to production.
- Where secrets live, and who has access to each account above.
- Monitoring and alerting for errors, uptime, and cost.
- Backups and a tested restore, if any data is stored.
- How each security and compliance principle in the constitution is met.
- Specific tools where the wizard only chose a category (see the "plan" questions).
