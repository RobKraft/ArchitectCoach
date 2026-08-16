# Local machine setup checklist

The goal: someone on a fresh machine should be able to follow this doc, in order, and end up with
a working local environment — without knowing anything about the project beforehand. See
`apps/local-govt-reporter-ai/CONTRIBUTING.md` for a fully filled-in real example.

## 1. List every real prerequisite — don't assume it's already there

- **Version control**: Git — check `git --version`.
- **Language runtime**: Node 20+ — check `node --version`. Install from nodejs.org or a version
  manager (nvm, fnm, volta).
- **Containerization**: Docker Desktop — check `docker --version`, and make sure Docker Desktop is
  actually running (not just installed) before `docker compose up`.
- **Package manager**: npm (ships with Node) — no fallback needed, no ADR behind this, it's just
  the default.
- **An LLM API key**: either an Anthropic API key or an OpenAI API key. Nothing degrades
  gracefully without one — the interview and the development-plan generation both require it;
  everything else (project list, Requirements/Architecture/Technology/Decisions pages, schema)
  works without one.

## 2. Step-by-step project setup

```
docker compose up -d              # starts Postgres
npm install
npx prisma migrate dev            # creates the schema
cp .env.example .env.local        # then edit .env.local: set LLM_PROVIDER and the matching key
npm run dev                       # http://localhost:3001 (3001, not 3000 — see package.json)
```

## 3. How to verify the setup actually worked

- `http://localhost:3001` loads and shows "Start a new project" — proves the app, Postgres
  connection, and Prisma schema are all working, no API key required.
- Create a project and open its Interview page; send a message. If it replies, the LLM key and
  provider are configured correctly. If it errors, check `LLM_PROVIDER` matches which key you set.
- `npm test` — the automated suite. One integration test requires Postgres to be running (see
  `docker compose up -d` above); it's written to skip with a clear message if Postgres isn't
  reachable, rather than fail confusingly.

## 4. Repository conventions

No CI, no enforced branch-naming or commit-message convention yet — single-developer prototype.
See `docs/decisions/` for ADRs, `docs/coding-standards.md` and `docs/testing-standards.md` for
what does apply.
