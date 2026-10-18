# Technical context

Give this to `/speckit.plan`, together with the answered "plan" questions in `open-questions.md`.

## Chosen technology and architecture

| Decision | Chosen | Deployment complexity | Ballpark cost | Scalability |
|---|---|---|---|---|
| How should posts be authored and the site built? | Headless CMS (e.g. Contentful, Sanity) plus a static site generator | Medium | Free | High |
| Where should this be hosted? | Netlify | Low | Free | High |
| Do you want reader comments on posts? | Lightweight third-party comments (e.g. giscus, Disqus) | Low | Free | High |

Cost buckets are rough monthly figures as of October 2026.

## Accounts and integrations the plan must cover

Each needs an owner, credentials stored safely, and (if paid) a budget alert:

- Headless CMS (e.g. Contentful, Sanity)
- Git repository
- Hosting account
- Domain registrar
- Netlify account
- Comment service (giscus uses GitHub Discussions; Disqus has its own account)

## The plan must include

- Environments and how code gets from a commit to production.
- Where secrets live, and who has access to each account above.
- Monitoring and alerting for errors, uptime, and cost.
- Backups and a tested restore, if any data is stored.
- How each security and compliance principle in the constitution is met.
- Specific tools where the wizard only chose a category (see the "plan" questions).
