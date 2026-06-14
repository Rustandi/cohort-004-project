// ─── Comment Permissions ───
// Pure authorization checks for comment mutations. The security-sensitive seam
// (see ADR-0005) — always re-checked server-side, never trusted from the client.

type CommentOwnership = { userId: number };

// Only the author may edit their own comment.
export function canEditComment(
  comment: CommentOwnership,
  userId: number | null
): boolean {
  return userId !== null && comment.userId === userId;
}
