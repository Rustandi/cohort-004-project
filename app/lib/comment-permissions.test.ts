import { describe, it, expect } from "vitest";
import { canEditComment } from "./comment-permissions";

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
