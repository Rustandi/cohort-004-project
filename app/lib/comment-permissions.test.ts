import { describe, it, expect } from "vitest";
import { canEditComment, canDeleteComment } from "./comment-permissions";
import { UserRole } from "~/db/schema";

describe("canEditComment", () => {
  it("allows the author to edit their own comment", () => {
    expect(canEditComment({ userId: 4 }, 4)).toBe(true);
  });

  it("forbids a non-author from editing", () => {
    expect(canEditComment({ userId: 4 }, 7)).toBe(false);
  });

  it("forbids a logged-out user (null) from editing", () => {
    expect(canEditComment({ userId: 4 }, null)).toBe(false);
  });
});

describe("canDeleteComment", () => {
  // comment authored by user 4, on a course whose owner (instructor) is user 2.
  const comment = { userId: 4 };
  const instructorId = 2;

  it("allows the author to delete their own comment", () => {
    const actor = { id: 4, role: UserRole.Student };
    expect(canDeleteComment(comment, actor, instructorId)).toBe(true);
  });

  it("allows the course owner (instructor) to delete any comment", () => {
    const actor = { id: 2, role: UserRole.Instructor };
    expect(canDeleteComment(comment, actor, instructorId)).toBe(true);
  });

  it("allows an admin to delete any comment", () => {
    const actor = { id: 9, role: UserRole.Admin };
    expect(canDeleteComment(comment, actor, instructorId)).toBe(true);
  });

  it("forbids an unrelated enrolled user from deleting", () => {
    const actor = { id: 7, role: UserRole.Student };
    expect(canDeleteComment(comment, actor, instructorId)).toBe(false);
  });

  it("forbids a logged-out user (null actor) from deleting", () => {
    expect(canDeleteComment(comment, null, instructorId)).toBe(false);
  });
});
