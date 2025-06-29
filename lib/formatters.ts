import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
} from "date-fns";

export const formatDateRelative = (
  date: string | Date | undefined,
  locale: string = "en",
): string => {
  if (!date) return "";

  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const daysDiff = differenceInDays(now, d);

  // For dates within the last 2 days, use relative time formatting
  if (daysDiff < 2) {
    const hoursDiff = differenceInHours(now, d);
    const minutesDiff = differenceInMinutes(now, d);

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

    if (minutesDiff < 60) {
      return rtf.format(-minutesDiff, "minute");
    } else if (hoursDiff < 24) {
      return rtf.format(-hoursDiff, "hour");
    } else {
      return rtf.format(-daysDiff, "day");
    }
  }

  // For older dates, use standard date formatting
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
};

export const formatSalary = (
  compensation:
    | {
        min?: number;
        max?: number;
        currency?: string;
        type?: string;
      }
    | null
    | undefined,
) => {
  if (!compensation) return null;

  const { min, max, currency = "USD", type } = compensation;
  const symbol = currency === "USD" ? "$" : currency;

  if (min && max) {
    return `${symbol}${min.toLocaleString()} - ${symbol}${max.toLocaleString()} ${type === "annual" ? "/year" : "/hr"}`;
  } else if (min) {
    return `${symbol}${min.toLocaleString()}+ ${type === "annual" ? "/year" : "/hr"}`;
  }
  return null;
};

export const timeAgo = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
};
