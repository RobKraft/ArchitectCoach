# ADR-0001: Static site build approach

**Status:** accepted
**Date:** 2026-01-02

## Context

Write content in templates/Markdown; the generator builds plain HTML at build time.

## Decision

Static site generator (e.g. Eleventy, Hugo, Jekyll) (for: "How should this site be built?")

## Alternatives considered

Plain HTML, CSS, and JavaScript — Hand-written pages, no build step, no framework. Component framework exported as static files (e.g. Next.js/Astro static export) — Build the site with a modern component framework, then export it to static HTML/JS at build time.

## Consequences

Shared layout and reusable content become easy, and output is still plain fast HTML — but you're adding a build step and a tool-specific templating language to learn.

Sets the authoring workflow for every page added later and determines what build tooling (if any) is part of the project going forward.