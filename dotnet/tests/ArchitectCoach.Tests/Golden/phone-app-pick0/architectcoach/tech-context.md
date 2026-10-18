# Technical context

Give this to `/speckit.plan`, together with the answered "plan" questions in `open-questions.md`.

## Chosen technology and architecture

| Decision | Chosen | Deployment complexity | Ballpark cost | Scalability |
|---|---|---|---|---|
| How should this app be built? | Native (separate Swift/iOS and Kotlin/Android codebases) | High | ~$10/mo | High |
| Does this app need a backend? | No backend — fully local/offline app | Low | Free | High |
| How do users sign in? | No accounts needed | Low | Free | High |
| Do you need push notifications? | No push notifications needed | Low | Free | High |

Cost buckets are rough monthly figures as of October 2026.

## Accounts and integrations the plan must cover

Each needs an owner, credentials stored safely, and (if paid) a budget alert:

- Apple Developer Program
- Google Play Console
- Code-signing certificates and keys
- Crash reporting (e.g. Crashlytics)

## The plan must include

- Environments and how code gets from a commit to production.
- Where secrets live, and who has access to each account above.
- Monitoring and alerting for errors, uptime, and cost.
- Backups and a tested restore, if any data is stored.
- How each security and compliance principle in the constitution is met.
- Specific tools where the wizard only chose a category (see the "plan" questions).
