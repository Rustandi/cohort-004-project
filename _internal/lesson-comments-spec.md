# Lesson Comments — v1 Spec

**Concept:** Public discussion under a lesson (YouTube-comments style), **flat** (no threading).

## Access (reuses `isUserEnrolled`)
- **Read:** enrolled users only
- **Write:** any enrolled user (any role)

## Lifecycle
- Author can **edit** own comment → sets `updatedAt`, shows "(edited)"
- Author can **delete** own comment (hard delete, `window.confirm` first)
- **Moderator delete:** course owner (`comment.userId` vs `course.instructorId`) or `Admin` can delete any comment
- No approval queue, no flagging — reactive moderation only

## Content
- Plain text, rendered with `whitespace-pre-wrap` (React auto-escapes — no XSS surface)
- zod validation: non-empty after trim, ~2,000 char cap

## Display
- `UserAvatar` + name + relative timestamp (absolute in `title` tooltip) + "(edited)"
- **"Instructor" badge** when `comment.userId === course.instructorId` (no admin badge)
- Newest-first, **load all** (no pagination), folded into the lesson `loader`
- Non-optimistic UI; `toast` success/error; inline edit toggle

## Architecture
- **Schema:** `comments(id, lessonId→lessons, userId→users, content, createdAt, updatedAt)` + index on `lessonId`. `courseId` is **not** denormalized — derive via lesson→module→course.
- **`commentService.ts`** (mirrors `ratingService.ts`, positional-param convention) — CRUD + a `getCourseIdForLesson` helper for gating.
- **`api.comments.ts`** resource route — intent dispatch (`post-comment` / `edit-comment` / `delete-comment`) → service; re-checks enrollment + author/moderator permission server-side.
- **`<CommentSection>`** component on the lesson page, submits via `useFetcher` to the resource route.
- New: a small relative-time helper in `lib/utils.ts`.

## Security seam (critical)
The resource route MUST independently re-resolve the lesson→course chain and re-check enrollment + ownership on **every** mutation. Never trust a `courseId` or permission flag sent from the client.

## Tests
Pure logic only (validation rules + moderator-permission check, extracted as pure functions), matching the `lib/*.test.ts` convention. No route/DB integration tests.

## Explicit non-goals (v1)
- Threading / replies
- Likes / reactions
- Notifications
- Reporting / flagging
- @mentions / media / uploads
- Comment-count badges elsewhere (sidebar, course cards)
