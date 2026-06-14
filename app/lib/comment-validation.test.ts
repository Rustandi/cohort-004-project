import { describe, it, expect } from "vitest";
import { commentContentSchema } from "./comment-validation";

describe("commentContentSchema", () => {
  it("rejects empty or whitespace-only content", () => {
    expect(commentContentSchema.safeParse({ content: "" }).success).toBe(false);
    expect(commentContentSchema.safeParse({ content: "   " }).success).toBe(
      false
    );
  });

  it("rejects content longer than 2000 characters", () => {
    expect(
      commentContentSchema.safeParse({ content: "a".repeat(2001) }).success
    ).toBe(false);
    expect(
      commentContentSchema.safeParse({ content: "a".repeat(2000) }).success
    ).toBe(true);
  });

  it("trims surrounding whitespace from valid content", () => {
    const result = commentContentSchema.safeParse({ content: "  hello  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBe("hello");
    }
  });
});
