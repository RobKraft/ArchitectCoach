# Technical context

Give this to `/speckit.plan`, together with the answered "plan" questions in `open-questions.md`.

## Chosen technology and architecture

| Decision | Chosen | Deployment complexity | Ballpark cost | Scalability |
|---|---|---|---|---|
| How should posts be authored and the site built? | Markdown files in a static site generator (e.g. Hugo, Eleventy, Jekyll) | Low | Free | High |
| Where should this be hosted? | GitHub Pages | Low | Free | Medium |
| Do you want reader comments on posts? | No comments | Low | Free | High |

Cost buckets are rough monthly figures as of October 2026.

## Accounts and integrations the plan must cover

Each needs an owner, credentials stored safely, and (if paid) a budget alert:

- Git repository (e.g. GitHub)
- Hosting account
- Domain registrar
- GitHub account

## The plan must include

- Environments and how code gets from a commit to production.
- Where secrets live, and who has access to each account above.
- Monitoring and alerting for errors, uptime, and cost.
- Backups and a tested restore, if any data is stored.
- How each security and compliance principle in the constitution is met.
- Specific tools where the wizard only chose a category (see the "plan" questions).
