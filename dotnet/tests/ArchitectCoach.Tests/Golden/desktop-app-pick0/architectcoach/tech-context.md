# Technical context

Give this to `/speckit.plan`, together with the answered "plan" questions in `open-questions.md`.

## Chosen technology and architecture

| Decision | Chosen | Deployment complexity | Ballpark cost | Scalability |
|---|---|---|---|---|
| How should this app be built? | Native desktop toolkit (e.g. WinForms/WPF, Cocoa/AppKit, Qt/GTK) | Medium | ~$10/mo | High |
| Does it need local data storage? | No persistent data needed | Low | Free | High |
| How will people install and update it? | Manual download from a website | Low | ~$10/mo | Medium |
| Does the app require user accounts? | No accounts needed — works standalone | Low | Free | High |

Cost buckets are rough monthly figures as of October 2026.

## Accounts and integrations the plan must cover

Each needs an owner, credentials stored safely, and (if paid) a budget alert:

- Code-signing certificate (Windows)
- Apple Developer Program (Mac signing and notarization)
- Download hosting (website or GitHub Releases)
- Code-signing certificates

## The plan must include

- Environments and how code gets from a commit to production.
- Where secrets live, and who has access to each account above.
- Monitoring and alerting for errors, uptime, and cost.
- Backups and a tested restore, if any data is stored.
- How each security and compliance principle in the constitution is met.
- Specific tools where the wizard only chose a category (see the "plan" questions).
