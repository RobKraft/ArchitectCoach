# ADR-0002: Static website hosting

**Status:** accepted
**Date:** 2026-01-02

## Context

Free hosting straight from a GitHub repo.

## Decision

GitHub Pages (for: "Where should this site be hosted?")

## Alternatives considered

Netlify — Static hosting with built-in CI/CD, form handling, and a generous free tier. Vercel — Static hosting with strong support for modern frontend frameworks and fast global CDN delivery. Traditional web hosting (shared hosting or a VPS) — Upload files to a conventional web host you pay for directly.

## Consequences

Free and simple, but fewer built-in features (no server-side redirects, limited build customization) than a dedicated static host.

Determines the deploy workflow and how a custom domain and HTTPS get configured.