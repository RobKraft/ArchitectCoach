# ADR-0002: Static website hosting

**Status:** accepted
**Date:** 2026-01-02

## Context

Static hosting with strong support for modern frontend frameworks and fast global CDN delivery.

## Decision

Vercel (for: "Where should this site be hosted?")

## Alternatives considered

GitHub Pages — Free hosting straight from a GitHub repo. Netlify — Static hosting with built-in CI/CD, form handling, and a generous free tier. Traditional web hosting (shared hosting or a VPS) — Upload files to a conventional web host you pay for directly.

## Consequences

Excellent if the build approach above is a component framework; less of an advantage for plain HTML or a generator site where Netlify's form handling matters more.

Determines the deploy workflow and how a custom domain and HTTPS get configured.