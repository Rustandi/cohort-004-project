# 2. Comments keyed by lesson only (no denormalized courseId)

Date: 2026-06-14
Status: Accepted

## Context

A comment is attached to a **lesson**, but every access decision is about the
**course**: enrollment gates read+write (see ADR-0004), and moderation compares
against `course.instructorId` (see ADR-0005). Getting from a lesson to its
course is a two-hop walk: `lessons.moduleId → modules.courseId`.

We could **denormalize** `courseId` onto each comment row so gating and
moderation become single-table reads, at the cost of a redundant column that
must stay consistent.

## Decision

Store **`lessonId` only** on the `comments` table. Derive `courseId` per request
by walking lesson → module → course. The comment service exposes a
`getCourseIdForLesson` helper for the repeated lookup.

Table shape:

```
comments(id, lessonId → lessons, userId → users, content, createdAt, updatedAt)
index on lessonId
```

## Consequences

- No denormalization invariant to maintain; single source of truth.
- Each mutation does a two-hop lookup — acceptable at this scale, and the
  resource route loads the lesson anyway to validate it exists.
- A future "comment count per course" aggregate needs a join rather than a
  single-column scan; acceptable given counts-elsewhere is out of scope for v1.
