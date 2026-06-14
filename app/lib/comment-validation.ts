import { z } from "zod";

// ─── Comment Validation ───
// Comments are plain text (see ADR-0003). Content is trimmed, must be non-empty,
// and is capped to keep a single comment reasonable. Shared by the api.comments
// resource route and unit tests.

export const MAX_COMMENT_LENGTH = 2000;

export const commentContentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Comment cannot be empty")
    .max(MAX_COMMENT_LENGTH, `Comment must be ${MAX_COMMENT_LENGTH} characters or fewer`),
});
