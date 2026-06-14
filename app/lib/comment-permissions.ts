// ─── Comment Permissions ───
// Pure authorization checks for comment mutations. The security-sensitive seam
// (see ADR-0005) — always re-checked server-side, never trusted from the client.

import { UserRole } from "~/db/schema";

type CommentOwnership = { userId: number };

// The acting viewer: their id and role. Null when logged out.
type CommentActor = { id: number; role: UserRole } | null;

// Only the author may edit their own comment.
export function canEditComment(
  comment: CommentOwnership,
  userId: number | null
): boolean {
  return userId !== null && comment.userId === userId;
}

// A comment may be deleted by its author, by the course owner (the instructor
// who owns the course the comment lives under), or by an admin. This is the
// moderator seam from ADR-0005 — reactive moderation, no approval queue.
export function canDeleteComment(
  comment: CommentOwnership,
  actor: CommentActor,
  instructorId: number
): boolean {
  if (!actor) return false;
  return (
    comment.userId === actor.id ||
    actor.id === instructorId ||
    actor.role === UserRole.Admin
  );
}
