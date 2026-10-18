# ADR-0001: Static site build approach

**Status:** accepted
**Date:** 2026-01-02

## Context

Build the site with a modern component framework, then export it to static HTML/JS at build time.

## Decision

Component framework exported as static files (e.g. Next.js/Astro static export) (for: "How should this site be built?")

## Alternatives considered

Plain HTML, CSS, and JavaScript — Hand-written pages, no build step, no framework. Static site generator (e.g. Eleventy, Hugo, Jekyll) — Write content in templates/Markdown; the generator builds plain HTML at build time.

## Consequences

Most powerful option for interactive components and future growth, but it's the heaviest tooling for a site that may never need it — overkill for a simple brochure site or blog.

Sets the authoring workflow for every page added later and determines what build tooling (if any) is part of the project going forward.