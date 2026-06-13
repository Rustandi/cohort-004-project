import { describe, it, expect, beforeEach, vi } from "vitest";
import { createTestDb, seedBaseData } from "~/test/setup";
import * as schema from "~/db/schema";

let testDb: ReturnType<typeof createTestDb>;
let base: ReturnType<typeof seedBaseData>;

vi.mock("~/db", () => ({
  get db() {
    return testDb;
  },
}));

// Import mock so module picks up our test db
import {
  upsertRating,
  getUserRating,
  getCourseRatingSummary,
  getCourseRatingSummaries,
} from "./ratingService";

function makeUser(name: string, email: string) {
  return testDb
    .insert(schema.users)
    .values({ name, email, role: schema.UserRole.Student })
    .returning()
    .get();
}

describe("ratingService", () => {
  beforeEach(() => {
    testDb = createTestDb();
    base = seedBaseData(testDb);
  });

  describe("upsertRating", () => {
    it("creates a rating for a user/course", () => {
      const rating = upsertRating(base.user.id, base.course.id, 4);

      expect(rating).toBeDefined();
      expect(rating.userId).toBe(base.user.id);
      expect(rating.courseId).toBe(base.course.id);
      expect(rating.rating).toBe(4);
    });

    it("updates the existing rating instead of creating a duplicate", () => {
      upsertRating(base.user.id, base.course.id, 2);
      upsertRating(base.user.id, base.course.id, 5);

      expect(getUserRating(base.user.id, base.course.id)).toBe(5);
      expect(getCourseRatingSummary(base.course.id).count).toBe(1);
    });

    it("rejects ratings outside 1-5", () => {
      expect(() => upsertRating(base.user.id, base.course.id, 0)).toThrowError();
      expect(() => upsertRating(base.user.id, base.course.id, 6)).toThrowError();
      expect(() =>
        upsertRating(base.user.id, base.course.id, 3.5)
      ).toThrowError();
    });
  });

  describe("getUserRating", () => {
    it("returns the user's rating", () => {
      upsertRating(base.user.id, base.course.id, 3);
      expect(getUserRating(base.user.id, base.course.id)).toBe(3);
    });

    it("returns null when the user has not rated", () => {
      expect(getUserRating(base.user.id, base.course.id)).toBeNull();
    });
  });

  describe("getCourseRatingSummary", () => {
    it("returns the average and count across users", () => {
      const second = makeUser("Second", "second@example.com");
      const third = makeUser("Third", "third@example.com");

      upsertRating(base.user.id, base.course.id, 5);
      upsertRating(second.id, base.course.id, 4);
      upsertRating(third.id, base.course.id, 3);

      const summary = getCourseRatingSummary(base.course.id);
      expect(summary.count).toBe(3);
      expect(summary.average).toBeCloseTo(4);
    });

    it("returns zeros when there are no ratings", () => {
      expect(getCourseRatingSummary(base.course.id)).toEqual({
        average: 0,
        count: 0,
      });
    });
  });

  describe("getCourseRatingSummaries", () => {
    it("returns a map keyed by courseId", () => {
      upsertRating(base.user.id, base.course.id, 5);

      const summaries = getCourseRatingSummaries([base.course.id]);
      expect(summaries.get(base.course.id)).toEqual({
        average: 5,
        count: 1,
      });
    });

    it("omits courses with no ratings and handles an empty input", () => {
      expect(getCourseRatingSummaries([]).size).toBe(0);
      expect(getCourseRatingSummaries([base.course.id]).size).toBe(0);
    });
  });
});
