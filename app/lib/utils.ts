import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a price in cents to a display string.
 * 0 or null/undefined → "Free", otherwise "$X.XX".
 */
export function formatPrice(cents: number | null | undefined): string {
  if (!cents) return "Free";
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Format an ISO timestamp as a relative time string (e.g. "5 minutes ago").
 * `now` is injected for deterministic testing.
 */
export function formatRelativeTime(iso: string, now: Date): string {
  const diffSeconds = Math.floor((now.getTime() - new Date(iso).getTime()) / 1000);

  if (diffSeconds < 60) return "just now";

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? "minute" : "minutes"} ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
}

export function formatDuration(
  minutes: number,
  showHours: boolean,
  showSeconds: boolean,
  padZeros: boolean
): string {
  if (minutes <= 0) return padZeros ? "00m" : "0m";

  if (showHours && minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const hStr = padZeros ? String(h).padStart(2, "0") : String(h);
    const mStr = padZeros ? String(m).padStart(2, "0") : String(m);
    if (showSeconds) {
      return `${hStr}h ${mStr}m 00s`;
    }
    return m > 0 ? `${hStr}h ${mStr}m` : `${hStr}h`;
  }

  const mStr = padZeros ? String(minutes).padStart(2, "0") : String(minutes);
  if (showSeconds) {
    return `${mStr}m 00s`;
  }
  return `${mStr}m`;
}
