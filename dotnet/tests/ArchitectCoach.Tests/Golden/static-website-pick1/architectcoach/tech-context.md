# Technical context

Give this to `/speckit.plan`, together with the answered "plan" questions in `open-questions.md`.

## Chosen technology and architecture

| Decision | Chosen | Deployment complexity | Ballpark cost | Scalability |
|---|---|---|---|---|
| How should this site be built? | Static site generator (e.g. Eleventy, Hugo, Jekyll) | Low | Free | High |
| Where should this site be hosted? | Netlify | Low | Free | High |
| Do you need visitor analytics? | Privacy-friendly analytics (e.g. Plausible, Fathom) | Low | ~$10/mo | High |

Cost buckets are rough monthly figures as of October 2026.

## Accounts and integrations the plan must cover

Each needs an owner, credentials stored safely, and (if paid) a budget alert:

- Git repository (e.g. GitHub)
- Hosting account
- Domain registrar
- Netlify account
- Git repository
- Analytics vendor account (e.g. Plausible, Fathom)

## The plan must include

- Environments and how code gets from a commit to production.
- Where secrets live, and who has access to each account above.
- Monitoring and alerting for errors, uptime, and cost.
- Backups and a tested restore, if any data is stored.
- How each security and compliance principle in the constitution is met.
- Specific tools where the wizard only chose a category (see the "plan" questions).
