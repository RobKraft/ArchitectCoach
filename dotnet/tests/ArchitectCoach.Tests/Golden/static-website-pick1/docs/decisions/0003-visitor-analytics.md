# ADR-0003: Visitor analytics

**Status:** accepted
**Date:** 2026-01-02

## Context

Lightweight, cookie-free analytics services built around not tracking individual visitors.

## Decision

Privacy-friendly analytics (e.g. Plausible, Fathom) (for: "Do you need visitor analytics?")

## Alternatives considered

No analytics needed — Skip analytics entirely for now. Google Analytics — The most widely used analytics platform, free, with deep reporting features.

## Consequences

Usually a paid service (small monthly cost) and less granular than Google Analytics, but no cookie-consent banner needed and better visitor privacy.

Adds a third-party script (except for the "none" option) that runs in every visitor's browser.