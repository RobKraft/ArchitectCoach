# ADR-0003: Visitor analytics

**Status:** accepted
**Date:** 2026-01-02

## Context

Skip analytics entirely for now.

## Decision

No analytics needed (for: "Do you need visitor analytics?")

## Alternatives considered

Privacy-friendly analytics (e.g. Plausible, Fathom) — Lightweight, cookie-free analytics services built around not tracking individual visitors. Google Analytics — The most widely used analytics platform, free, with deep reporting features.

## Consequences

Simplest and most private option, but you'll have no visibility into traffic or what content is actually working.

Adds a third-party script (except for the "none" option) that runs in every visitor's browser.