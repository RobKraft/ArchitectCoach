# ADR-0002: Static website hosting

**Status:** accepted
**Date:** 2026-01-02

## Context

Static hosting with built-in CI/CD, form handling, and a generous free tier.

## Decision

Netlify (for: "Where should this site be hosted?")

## Alternatives considered

GitHub Pages — Free hosting straight from a GitHub repo. Vercel — Static hosting with strong support for modern frontend frameworks and fast global CDN delivery. Traditional web hosting (shared hosting or a VPS) — Upload files to a conventional web host you pay for directly.

## Consequences

The built-in form handling is genuinely useful for a static site with no backend, but you're depending on a third-party platform for that feature rather than owning it.

Determines the deploy workflow and how a custom domain and HTTPS get configured.