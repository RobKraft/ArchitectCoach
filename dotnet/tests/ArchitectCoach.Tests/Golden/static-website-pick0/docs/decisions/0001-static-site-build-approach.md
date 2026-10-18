# ADR-0001: Static site build approach

**Status:** accepted
**Date:** 2026-01-02

## Context

Hand-written pages, no build step, no framework.

## Decision

Plain HTML, CSS, and JavaScript (for: "How should this site be built?")

## Alternatives considered

Static site generator (e.g. Eleventy, Hugo, Jekyll) — Write content in templates/Markdown; the generator builds plain HTML at build time. Component framework exported as static files (e.g. Next.js/Astro static export) — Build the site with a modern component framework, then export it to static HTML/JS at build time.

## Consequences

Zero tooling to learn or maintain, but repeating shared elements (nav, footer) across pages is manual and error-prone as the site grows past a handful of pages.

Sets the authoring workflow for every page added later and determines what build tooling (if any) is part of the project going forward.