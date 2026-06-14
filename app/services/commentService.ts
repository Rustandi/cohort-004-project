import { eq, desc } from "drizzle-orm";
import { db } from "~/db";
import { comments, users, lessons, modules } from "~/db/schema";

// ─── Comment Service ───
// Handles flat, plain-text lesson comments (see ADR-0001, ADR-0003).
// Comments are keyed by lesson; the owning course is derived via
// lesson → module → course (ADR-0002). Uses positional parameters
// (project convention).

export type CommentWithAuthor = {
  id: number;
  lessonId: number;
  userId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  authorName: string;
  authorAvatarUrl: string | null;
};

// All comments on a lesson, newest-first, joined with author display info.
export function getCommentsForLesson(lessonId: number): CommentWithAuthor[] {
  return db
    .select({
      id: comments.id,
      lessonId: comments.lessonId,
      userId: comments.userId,
      content: comments.content,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
      authorName: users.name,
      authorAvatarUrl: users.avatarUrl,
    })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.lessonId, lessonId))
    .orderBy(desc(comments.createdAt))
    .all();
}

// Create a comment. Content is assumed already validated/trimmed by the caller
// (see commentContentSchema).
export function createComment(
  userId: number,
  lessonId: number,
  content: string
) {
  return db
    .insert(comments)
    .values({ userId, lessonId, content })
    .returning()
    .get();
}

// The id of the course that owns a lesson, or null if the lesson does not exist.
// Used to gate comment access on enrollment / instructor ownership.
export function getCourseIdForLesson(lessonId: number): number | null {
  const result = db
    .select({ courseId: modules.courseId })
    .from(lessons)
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .where(eq(lessons.id, lessonId))
    .get();

  return result?.courseId ?? null;
}
