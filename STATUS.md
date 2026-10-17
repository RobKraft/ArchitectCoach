# ArchitectCoach — status / where we left off

Last updated: 2026-09-03

## What's built

**The interview is now a click-only wizard, not a free-text chat.** Project creation
(`NewProjectForm.tsx`) forces picking one of the 5 `PROJECT_TYPE_OPTIONS` — the "Something
else…" free-text fallback was removed. For all 5 project types, `src/lib/wizard/catalog.ts` is a
hand-authored, static catalog of every interview question, its options, and their tradeoffs —
**answering the wizard makes zero AI calls**. `src/lib/wizard/applyAnswer.ts` applies a pick by
calling the same `update_requirements`/`update_architecture`/`update_technology`/`record_decision`
functions the (now-unused-for-these-5-types) AI interview used to call, just driven by catalog
data instead of a model. `interview/page.tsx` picks the wizard path when
`WIZARD_CATALOG[project.name]` exists; otherwise it falls back to the original AI-driven
`ChatPanel` + `present_choice` tool-calling flow (kept working, but dead code for all 5 built-in
project types now — only matters if a 6th project type is ever added without a catalog entry).

**Two more features layered on top, built this session, not yet committed to git (see
"Uncommitted work" below):**

1. **"Discuss this with my AI"** — every wizard step (`WizardStepView.tsx`) shows a button that
   copies a full context prompt (project purpose, decisions so far, the current question, every
   option's tradeoffs) to the clipboard and opens a new tab to the developer's chosen AI
   (ChatGPT/Claude.ai/Gemini, remembered via `localStorage`; "copy only" also offered). Prompt text
   built generically in `src/lib/wizard/discussPrompt.ts` — works for all 5 project types with no
   per-type work, since it just reads whatever `ProjectKnowledge`/`WizardStep` it's given.
2. **Downloadable "AI Dev Kit"** — once the wizard for a project type is finished, a "Download AI
   Dev Kit" button appears (`interview/page.tsx`'s completion panel) that streams a ZIP
   (`src/app/api/projects/[id]/devkit/route.ts`, using `archiver`) containing coding standards,
   testing standards, four review checklists (security/performance/cost/accessibility), Definition
   of Done, review checklist, AI-collaboration guide, local-setup checklist, a PR template, and
   every recorded Decision Record exported as a real numbered ADR — all **tailored with the
   project's actual answers**, not generic boilerplate (`src/lib/devkit/generate.ts`). Content is
   adapted from `ai-dev-kit/practices/` (this workspace's own template kit).
   **Currently tailored for "Static website" only** — `DEVKIT_SUPPORTED_TYPES` in
   `generate.ts` gates the download button/route to that one type; the other 4 need their own
   tailored content written the same way before the button appears for them. Verified end-to-end
   with a real curl smoke test: created a project, answered all 5 steps via the API, downloaded the
   ZIP, unzipped it, confirmed all 16 files exist with correctly-tailored content (not
   placeholders), then deleted the test project.

Target audience was reframed this session to **junior developers** — nothing content-wise has
been reworked for that yet beyond the "explain it simply" instruction baked into the discuss-AI
prompt; the wizard's own tradeoffs text (written pre-reframe) hasn't been revisited for tone.

## Uncommitted work — commit before doing anything else next session

`git status` shows these are **not yet committed**:
- `src/components/DiscussWithAI.tsx`, `src/lib/wizard/discussPrompt.ts`
- `src/lib/devkit/` (whole folder), `src/app/api/projects/[id]/devkit/` (whole folder)
- `tests/devkit.test.ts`, `tests/discussPrompt.test.ts`
- Modified: `src/app/projects/[id]/interview/page.tsx`, `src/components/WizardStepView.tsx`,
  `package.json`/`package-lock.json` (the `archiver` + `@types/archiver` dependency — pinned to
  **v7.0.1**, not the newer v8, because v8's ESM `exports` field breaks Next.js's webpack build
  with `Module not found: Default condition should be last one`; don't upgrade without retesting
  `npm run build`).

Everything before this (the wizard-only pivot, `present_choice`, the 5-project-type catalog) **is**
committed and pushed — see commit `3b0b6cc` on `origin/master`
(`RobKraft/ArchitectCoach`).

## Verified this session

- `tsc --noEmit`, `eslint .`, `npm run build` all clean with the new code.
- `npm test`: **43/43 passing** (includes two new real-Postgres integration test files —
  `wizard.integration.test.ts`, and the pre-existing `interviewTools.integration.test.ts` — plus
  new `wizardCatalog.test.ts`, `devkit.test.ts`, `discussPrompt.test.ts`).
- Real dev-server smoke test of the full wizard → ZIP download path (see above) — not just unit
  tests, an actual generated file was inspected.

## Deployment research this session — decisions and open questions, no code yet

Nothing below has been implemented — this is context so the conversation doesn't need to be
re-derived:

- **Host**: leaning **Azure** (user preference — wants the platform experience, has an existing
  Azure account already running a $5/month SQL Server instance for another project).
- **App hosting decision**: recommended **Azure App Service (Linux, Basic B1, ~$13/month)** over
  Azure Static Web Apps' free tier — SWA's Next.js "hybrid" SSR support runs your code via
  automatically-managed Azure Functions (so it does provide real compute, contrary to SWA's
  "just static files" reputation), but that's a compatibility-shim layer with real uncertainty
  around full App Router support. App Service runs a literal `next start` process — same model as
  local dev, no guessing.
- **Database — open question, not resolved**: whether to (a) use a free-forever tier (Neon or
  Supabase) decoupled from Azure entirely, or (b) reuse the user's existing $5/month Azure SQL
  Server by adding this app's tables to it. Option (b) has a **real schema blocker**: `schema.prisma`'s
  `DecisionRecord.learnMore String[]` is a native Postgres array — SQL Server has no equivalent in
  Prisma's connector, so it would need to become a JSON string or a related table, plus a fresh
  (non-Postgres) migration history, before this app could run on SQL Server at all. Also unresolved:
  whether "reuse" means the *same* database (free, but shares that instance's already-below-minimum
  resources with another app) or a *second* similarly-sized database (~another $5/month).
- **Domain**: user already owns domain hosting via SmarterASP.NET (unlimited domains) — decided
  there's no need to move DNS to Azure/AWS at all; just add one CNAME record at the existing
  provider pointing to wherever the app ends up hosted. Azure Static Web Apps' free tier supports
  custom domains at no cost; Azure DNS zones (~$0.50/month) were explicitly ruled unnecessary.
- **Security gap, not yet addressed**: none of the API routes (`/api/projects*`) have any
  authentication, rate limiting, or CORS configuration — confirmed by reading the code, not
  assumed. Since the wizard itself makes zero AI calls now, the main cost-risk (someone hammering
  `/api/projects/[id]/chat` or `/api/projects/[id]/plan`) is much smaller than before, but there's
  still no per-user data isolation (`GET /api/projects` returns every project to anyone). Deploying
  with **no AI API key configured** was confirmed safe (checked `provider.ts` — the key is only
  read lazily inside the chat/plan route handlers, nothing crashes without it; only "Generate Plan"
  would fail).
- **DBeaver connection** (for the local dev DB, unrelated to production): host `localhost`, port
  `5433`, database `architectcoach`, user/password `architectcoach`.

## Not yet done — pick up here

1. **Commit the uncommitted work above.**
2. Replicate the AI Dev Kit's tailored content for the other 4 project types (Static site with a
   blog, Site with a backend/database, Phone app, Desktop app) — same pattern as
   `generate.ts`'s Static-website functions, then add each to `DEVKIT_SUPPORTED_TYPES`.
3. Decide the database question above (Neon/Supabase vs. existing Azure SQL Server) before
   actually provisioning anything for deployment.
4. Longer-term dev-kit idea floated but deferred: a deeper tier beyond docs-only — actual Claude
   Code `.claude/skills/*.md` files (security-review, performance-review, etc.) and/or a runnable
   test scaffold wired to the chosen stack, with an opt-out for the latter. Explicitly not started.
5. The original v0.1 backlog item (re-verify the AI-driven chat path live against a real model,
   tune `maxSteps`) is now low-priority — that path is only reachable for a hypothetical 6th
   uncataloged project type.
6. Still no CI, no real deployment, no auth on API routes (see above).

## How to run it locally

```bash
cd apps/ArchitectCoach
docker compose up -d              # Postgres on localhost:5433 (Docker Desktop must be running)
npm install
npx prisma migrate dev
cp .env.example .env.local        # set LLM_PROVIDER + the matching API key (optional — the
                                   # wizard itself needs no AI key; only "Generate Plan" does)
npm run dev                       # http://localhost:3001
```

If Docker Desktop isn't already running, start it first and wait for `docker ps` to succeed before
`docker compose up -d`. See `docs/local-setup-checklist.md` for the full verification checklist.
