# 5. Enrolled-only access and reactive moderation

Date: 2026-06-14
Status: Accepted

## Context

Comments are a public discussion among the people on a course. We must decide
who can read, who can write, and how inappropriate content is removed.

Every other interactive feature on the lesson page (progress, quizzes,
mark-complete) is gated on `isUserEnrolled(userId, courseId)`. There is no
public marketing surface asking for comments to be visible to strangers.

## Decision

**Access:** enrolled users only, for both read and write. Reuses
`isUserEnrolled` as the single gate — no new access logic. Any enrolled user may
post regardless of role.

**Lifecycle / permissions:**

- Author may **edit** their own comment (sets `updatedAt`, shows "(edited)").
- Author may **delete** their own comment (hard delete — safe because comments
  are flat, see ADR-0001), guarded by `window.confirm`.
- **Moderator delete:** the course owner (`comment.userId === course.instructorId`)
  or an `Admin` may delete any comment on that course.

The author-or-moderator check is extracted as a **pure function** with unit
tests — it is the security-sensitive seam. Permission is always re-checked
server-side on the resource route (see ADR-0004).

**Moderation posture:** reactive delete-on-sight only. No approval queue, no
reporting/flagging workflow in v1.

## Consequences

- One consistent access line with the rest of the lesson page; zero new gating.
- No spam from drive-by non-enrolled accounts.
- Comments are not visible to non-enrolled visitors (no social proof / SEO) —
  an accepted v1 trade-off.
- Notifications, flagging, likes, and @mentions are explicitly out of scope.
