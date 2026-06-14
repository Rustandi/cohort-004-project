# 3. Plain-text comment content (no Markdown)

Date: 2026-06-14
Status: Accepted

## Context

Lesson *content* is authored in Markdown by trusted instructors and rendered
server-side via `renderMarkdown`, then injected with `dangerouslySetInnerHTML`.
Comments are **untrusted student input**. Reusing the same Markdown→HTML path on
comments would open an XSS hole unless the renderer is audited to sanitize raw
HTML.

Markdown would be nice for a coding audience (code blocks, links), but the
safety cost on untrusted input is real.

## Decision

Comment content is **plain text** in v1. Store the raw string; render it as text
(React auto-escapes) with `whitespace-pre-wrap` to preserve line breaks. No
Markdown, no HTML, no media.

Validation (zod, server-side): non-empty after trim, max ~2,000 characters.

## Consequences

- Zero XSS surface from comments; no sanitization audit required.
- No code formatting or links in comments — a known trade-off for this audience.
- Sanitized-Markdown support is a possible fast-follow, contingent on confirming
  `renderMarkdown` strips untrusted HTML first.
