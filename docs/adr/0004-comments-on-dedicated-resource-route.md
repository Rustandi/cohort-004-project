# 4. Comment mutations on a dedicated resource route

Date: 2026-06-14
Status: Accepted

## Context

Two established patterns exist for handling form submissions:

1. **Intent dispatch on the page action** — the lesson route's `action` already
   switches on `intent` (`mark-complete`, `submit-quiz`).
2. **Dedicated resource route** — a UI-less route handling `fetcher.submit`,
   e.g. `api.video-tracking.ts`.

The lesson route file (`courses.$slug.lessons.$lessonId.tsx`) is already ~1,050
lines with two intents, a quiz subcomponent, and PPP logic. Adding three comment
intents plus their schemas would push it further.

## Decision

Comment mutations live on a **dedicated resource route** (`api.comments.ts`)
that dispatches on intent (`post-comment` / `edit-comment` / `delete-comment`)
and delegates to a new `commentService` (mirroring `ratingService`). The
`<CommentSection>` UI component on the lesson page submits to it via `useFetcher`.

Comment **reads** still load in the lesson `loader` (newest-first, all of them),
since reads are part of page render.

## Consequences

- The oversized lesson route does not gain a fourth responsibility.
- Comment logic is isolated and independently testable; matches the
  video-tracking resource-route house style.
- The fetcher must target the resource route path explicitly rather than the
  default route action.

## Security note

The resource route MUST independently re-resolve lesson → course and re-check
enrollment + author/moderator permission on **every** mutation. Never trust a
`courseId` or permission flag sent from the client. See ADR-0005.
