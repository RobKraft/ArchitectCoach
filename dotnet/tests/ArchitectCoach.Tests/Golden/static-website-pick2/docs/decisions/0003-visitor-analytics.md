# ADR-0003: Visitor analytics

**Status:** accepted
**Date:** 2026-01-02

## Context

The most widely used analytics platform, free, with deep reporting features.

## Decision

Google Analytics (for: "Do you need visitor analytics?")

## Alternatives considered

No analytics needed — Skip analytics entirely for now. Privacy-friendly analytics (e.g. Plausible, Fathom) — Lightweight, cookie-free analytics services built around not tracking individual visitors.

## Consequences

Free and extremely capable, but adds real tracking of individual visitors, which typically requires a cookie-consent banner depending on your audience's location.

Adds a third-party script (except for the "none" option) that runs in every visitor's browser.