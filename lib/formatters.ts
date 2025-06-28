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
