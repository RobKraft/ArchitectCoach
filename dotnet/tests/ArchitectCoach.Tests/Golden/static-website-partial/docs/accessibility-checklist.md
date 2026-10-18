# Accessibility checklist

## Structure

- [ ] Headings are used in order (one `<h1>` per page, no skipped levels) — not just styled to look like headings.
- [ ] Semantic HTML elements (`<nav>`, `<main>`, `<button>`, `<a>`) are used instead of generic `<div>`/`<span>` with click handlers.

## Images and media

- [ ] Every meaningful image has descriptive `alt` text; purely decorative images use `alt=""`.
- [ ] Any video has captions if it conveys information through audio.

## Color and contrast

- [ ] Text meets WCAG AA contrast ratio against its background (4.5:1 for normal text, 3:1 for large text).
- [ ] Color isn't the only way information is conveyed (e.g. a link isn't distinguished from body text by color alone).

## Keyboard and forms

- [ ] Every interactive element (links, buttons, form fields) is reachable and usable via keyboard alone, in a sensible tab order.
- [ ] Any form field has a real `<label>`, not just placeholder text.

## Verifying it

- [ ] Run an automated checker (axe, or Lighthouse's accessibility audit) against every new page — it won't catch everything, but it catches the common mistakes cheaply.
