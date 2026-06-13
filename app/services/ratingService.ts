import { eq, and, inArray, sql } from "drizzle-orm";
import { db } from "~/db";
import { courseRatings } from "~/db/schema";

// ─── Rating Service ───
// Handles course star ratings (1-5). One rating per user per course; submitting
// again updates the existing rating. Uses positional parameters (project convention).

export type RatingSummary = { average: number; count: number };

// Aggregate rating (average + count) for a single course.
export function getCourseRatingSummary(courseId: number): RatingSummary {
  const result = db
    .select({
      average: sql<number>`avg(${courseRatings.rating})`,
      count: sql<number>`count(*)`,
    })
    .from(courseRatings)
    .where(eq(courseRatings.courseId, courseId))
    .get();

  return {
    average: result?.average ?? 0,
    count: result?.count ?? 0,
  };
}

// Aggregate ratings for many courses at once, returned as a courseId -> summary
// map. Courses with no ratings are omitted (caller defaults to { average: 0, count: 0 }).
export function getCourseRatingSummaries(
  courseIds: number[]
): Map<number, RatingSummary> {
  const summaries = new Map<number, RatingSummary>();
  if (courseIds.length === 0) return summaries;

  const rows = db
    .select({
      courseId: courseRatings.courseId,
      average: sql<number>`avg(${courseRatings.rating})`,
      count: sql<number>`count(*)`,
    })
    .from(courseRatings)
    .where(inArray(courseRatings.courseId, courseIds))
    .groupBy(courseRatings.courseId)
    .all();

  for (const row of rows) {
    summaries.set(row.courseId, { average: row.average, count: row.count });
  }
  return summaries;
}

// The rating value (1-5) a user gave a course, or null if they haven't rated it.
export function getUserRating(
  userId: number,
  courseId: number
): number | null {
  const result = db
    .select({ rating: courseRatings.rating })
    .from(courseRatings)
    .where(
      and(
        eq(courseRatings.userId, userId),
        eq(courseRatings.courseId, courseId)
      )
    )
    .get();

  return result?.rating ?? null;
}

// Create or update a user's rating for a course. Rating must be an integer 1-5.
export function upsertRating(
  userId: number,
  courseId: number,
  rating: number
) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating must be an integer between 1 and 5");
  }

  return db
    .insert(courseRatings)
    .values({ userId, courseId, rating })
    .onConflictDoUpdate({
      target: [courseRatings.courseId, courseRatings.userId],
      set: { rating, updatedAt: new Date().toISOString() },
    })
    .returning()
    .get();
}
