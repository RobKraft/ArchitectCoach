# ADR-0009: Rewrite as ASP.NET Core Blazor (static SSR) + SQL Server on SmarterASP

**Status:** Accepted. Supersedes ADR-0002, 0003, 0004, and 0006; amends 0001 and 0005.
**Date:** 2026-10-18

## Context

ADR-0002 chose Next.js mainly for the streaming, tool-calling AI interview (Vercel AI SDK). Since
then the wizard and the downloadable Spec Kit replaced that interview (ADR-0007/0008), so the app
no longer needs AI on the server. The owner has unlimited ASP.NET hosting at SmarterASP (Windows/
IIS, SQL Server, MySQL, SMTP), where Next.js would need iisnode and a MySQL/SQL Server port anyway.
The owner works in .NET and wants a stack they can maintain themselves.

## Decision

Rewrite in **ASP.NET Core 10, Blazor with static server-side rendering** (no interactive render
mode) and **SQL Server via EF Core**, hosted on SmarterASP. The full plan is in
[docs/plans/dotnet-blazor-rewrite.md](../plans/dotnet-blazor-rewrite.md). The code lives in
`dotnet/` until it reaches parity, then the Next.js code is removed.

- **ADR-0001 amended:** `Project.Knowledge` stays one JSON document, now an EF Core JSON column
  (`OwnsOne(...).ToJson()`) on SQL Server.
- **ADR-0005 amended:** local dev uses LocalDB (no port) and the app on 5109.
- **ADR-0003 and 0006 superseded:** no LLM on the server, so no provider abstraction or
  moderation gate.
- **ADR-0004 superseded:** no Docker needed locally; LocalDB is used for development and for the
  integration tests (one throwaway database per test class).

## Alternatives considered

- **Keep Next.js and deploy to a Node host** (Render/Vercel + Neon): no rewrite cost, but a
  separate host and a stack the owner doesn't work in day to day.
- **Next.js on SmarterASP via iisnode + MySQL:** fragile hosting (iisnode, reported daily pool
  restarts) plus a schema port; the worst of both options.
- **Blazor Interactive Server:** a SignalR circuit per user that IIS app-pool recycles would drop
  mid-wizard, plus more attack surface. **Blazor WebAssembly + Web API:** needs a public JSON API,
  which is exactly the bypass surface we want to avoid.

## Consequences

- Rebuilding what already works costs several focused sessions before new features ship.
- Static SSR means plain form posts. Rich interactivity is less convenient, but the wizard
  doesn't need it, and plain forms are easier to make accessible.
- Security is enforced server-side in layers (ADR-0010 and plan §6), proven by integration tests.
- Assumes SmarterASP provides .NET 10 and working SMTP. The owner chose to assume this rather than
  run the Phase 0 probe first (`dotnet/HostingProbe/` remains available to confirm before launch).
