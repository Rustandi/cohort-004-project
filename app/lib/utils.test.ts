import { describe, it, expect } from "vitest";
import { formatRelativeTime, isEdited } from "./utils";

describe("isEdited", () => {
  it("is false when createdAt and updatedAt are identical", () => {
    const t = "2026-06-14T12:00:00.000Z";
    expect(isEdited(t, t)).toBe(false);
  });

  it("is true when updatedAt differs from createdAt", () => {
    expect(
      isEdited("2026-06-14T12:00:00.000Z", "2026-06-14T12:05:00.000Z")
    ).toBe(true);
  });
});

describe("formatRelativeTime", () => {
  const now = new Date("2026-06-14T12:00:00.000Z");

  it("returns 'just now' for timestamps under a minute old", () => {
    const iso = new Date("2026-06-14T11:59:30.000Z").toISOString();
    expect(formatRelativeTime(iso, now)).toBe("just now");
  });

  it("returns minutes ago, singular and plural", () => {
    expect(
      formatRelativeTime(new Date("2026-06-14T11:59:00.000Z").toISOString(), now)
    ).toBe("1 minute ago");
    expect(
      formatRelativeTime(new Date("2026-06-14T11:45:00.000Z").toISOString(), now)
    ).toBe("15 minutes ago");
  });

  it("returns hours ago, singular and plural", () => {
    expect(
      formatRelativeTime(new Date("2026-06-14T11:00:00.000Z").toISOString(), now)
    ).toBe("1 hour ago");
    expect(
      formatRelativeTime(new Date("2026-06-14T07:00:00.000Z").toISOString(), now)
    ).toBe("5 hours ago");
  });

  it("returns days ago, singular and plural", () => {
    expect(
      formatRelativeTime(new Date("2026-06-13T12:00:00.000Z").toISOString(), now)
    ).toBe("1 day ago");
    expect(
      formatRelativeTime(new Date("2026-06-11T12:00:00.000Z").toISOString(), now)
    ).toBe("3 days ago");
  });
});
