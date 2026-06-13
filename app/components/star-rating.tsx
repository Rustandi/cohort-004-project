import { useState } from "react";
import { useFetcher } from "react-router";
import { Star } from "lucide-react";
import { cn } from "~/lib/utils";

const STARS = [1, 2, 3, 4, 5];

function sizeClass(size: "sm" | "md" | "lg") {
  return size === "sm" ? "size-3.5" : size === "lg" ? "size-6" : "size-4";
}

// Read-only display of a course's average rating. Renders partial fills so a
// 4.3 average shows the fourth star ~30% filled. Optionally shows the count.
export function StarRatingDisplay({
  average,
  count,
  size = "md",
  showCount = true,
  className,
}: {
  average: number;
  count: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  className?: string;
}) {
  if (count === 0) {
    return (
      <span
        className={cn(
          "flex items-center gap-1.5 text-muted-foreground",
          className
        )}
      >
        <Star className={cn(sizeClass(size), "text-muted-foreground/40")} />
        <span className="text-xs">No ratings yet</span>
      </span>
    );
  }

  return (
    <span
      className={cn("flex items-center gap-1.5", className)}
      aria-label={`Rated ${average.toFixed(1)} out of 5 from ${count} ${
        count === 1 ? "rating" : "ratings"
      }`}
    >
      <span className="flex items-center">
        {STARS.map((star) => {
          const fill = Math.max(0, Math.min(1, average - (star - 1)));
          return (
            <span key={star} className="relative inline-block">
              <Star className={cn(sizeClass(size), "text-muted-foreground/40")} />
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star
                  className={cn(sizeClass(size), "fill-yellow-400 text-yellow-400")}
                />
              </span>
            </span>
          );
        })}
      </span>
      <span className="text-sm font-medium">{average.toFixed(1)}</span>
      {showCount && (
        <span className="text-xs text-muted-foreground">
          ({count})
        </span>
      )}
    </span>
  );
}

// Interactive star picker for enrolled students. Submits via a fetcher to the
// current route's action with intent="rate". Clicking a star saves immediately.
export function StarRatingInput({
  currentRating,
  className,
}: {
  currentRating: number | null;
  className?: string;
}) {
  const fetcher = useFetcher();
  const [hovered, setHovered] = useState<number | null>(null);

  // Reflect the in-flight submission optimistically.
  const submittedRating = fetcher.formData?.get("rating");
  const optimisticRating =
    typeof submittedRating === "string"
      ? Number(submittedRating)
      : currentRating;

  const active = hovered ?? optimisticRating ?? 0;

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className="flex items-center gap-1"
        onMouseLeave={() => setHovered(null)}
      >
        {STARS.map((star) => (
          <button
            key={star}
            type="button"
            aria-label={`Rate ${star} ${star === 1 ? "star" : "stars"}`}
            onMouseEnter={() => setHovered(star)}
            onClick={() =>
              fetcher.submit(
                { intent: "rate", rating: String(star) },
                { method: "post" }
              )
            }
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                "size-7",
                star <= active
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground/40"
              )}
            />
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {optimisticRating
          ? `You rated this course ${optimisticRating} out of 5. Tap to change.`
          : "Tap a star to rate this course."}
      </p>
    </div>
  );
}
